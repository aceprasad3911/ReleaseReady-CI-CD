terraform {
  required_version = ">= 1.9"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

variable "environment" {
  description = "Deployment environment (staging or production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be 'staging' or 'production'."
  }
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "uksouth"
}

variable "container_image" {
  description = "Full container image reference including tag"
  type        = string
}

variable "app_version" {
  description = "Application version or Git SHA"
  type        = string
  default     = "unknown"
}

locals {
  prefix    = "release-ready"
  full_name = "${local.prefix}-${var.environment}"
  tags = {
    environment = var.environment
    project     = "release-ready"
    managed_by  = "terraform"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "${local.full_name}-rg"
  location = var.location
  tags     = local.tags
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.full_name}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "production" ? 90 : 30
  tags                = local.tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = "${local.full_name}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

resource "azurerm_container_app" "main" {
  name                         = local.full_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  template {
    min_replicas = var.environment == "production" ? 2 : 1
    max_replicas = var.environment == "production" ? 10 : 3

    container {
      name   = "release-ready"
      image  = var.container_image
      cpu    = var.environment == "production" ? 1.0 : 0.5
      memory = var.environment == "production" ? "2Gi" : "1Gi"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "LOG_LEVEL"
        value = var.environment == "production" ? "warn" : "debug"
      }

      env {
        name  = "APP_VERSION"
        value = var.app_version
      }

      liveness_probe {
        path                    = "/api/healthz"
        port                    = 3000
        transport               = "HTTP"
        interval_seconds        = 30
        timeout                 = 10
        failure_count_threshold = 3
      }

      readiness_probe {
        path                    = "/api/healthz"
        port                    = 3000
        transport               = "HTTP"
        interval_seconds        = 10
        timeout                 = 5
        failure_count_threshold = 3
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

output "app_url" {
  description = "Public URL of the deployed Container App"
  value       = "https://${azurerm_container_app.main.latest_revision_fqdn}"
}

output "resource_group_name" {
  description = "Name of the Azure Resource Group"
  value       = azurerm_resource_group.main.name
}

output "container_app_name" {
  description = "Name of the Azure Container App"
  value       = azurerm_container_app.main.name
}
