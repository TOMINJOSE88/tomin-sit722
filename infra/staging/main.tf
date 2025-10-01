terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.29.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Namespace
resource "kubernetes_namespace" "staging" {
  metadata {
    name = "staging-${var.run_id}"
  }
}

# -------------------------
# Customer Service
# -------------------------
resource "kubernetes_deployment" "customer" {
  metadata {
    name      = "customer"
    namespace = kubernetes_namespace.staging.metadata[0].name
    labels = { app = "customer" }
  }

  lifecycle { ignore_changes = [metadata[0].generation] }

  spec {
    replicas = 1
    selector { match_labels = { app = "customer" } }
    template {
      metadata { labels = { app = "customer" } }
      spec {
        container {
          name  = "customer"
          image = var.customer_image
          port { container_port = 8080 }
        }
      }
    }
  }
}

resource "kubernetes_service" "customer" {
  metadata {
    name      = "customer-service"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }
  spec {
    selector = { app = "customer" }
    port {
      port        = 80
      target_port = 8080
    }
    type = "ClusterIP"
  }
}

# -------------------------
# Product Service
# -------------------------
resource "kubernetes_deployment" "product" {
  metadata {
    name      = "product"
    namespace = kubernetes_namespace.staging.metadata[0].name
    labels = { app = "product" }
  }

  lifecycle { ignore_changes = [metadata[0].generation] }

  spec {
    replicas = 1
    selector { match_labels = { app = "product" } }
    template {
      metadata { labels = { app = "product" } }
      spec {
        container {
          name  = "product"
          image = var.product_image
          port { container_port = 8080 }
        }
      }
    }
  }
}

resource "kubernetes_service" "product" {
  metadata {
    name      = "product-service"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }
  spec {
    selector = { app = "product" }
    port {
      port        = 80
      target_port = 8080
    }
    type = "ClusterIP"
  }
}

# -------------------------
# Order Service
# -------------------------
resource "kubernetes_deployment" "order" {
  metadata {
    name      = "order"
    namespace = kubernetes_namespace.staging.metadata[0].name
    labels = { app = "order" }
  }

  lifecycle { ignore_changes = [metadata[0].generation] }

  spec {
    replicas = 1
    selector { match_labels = { app = "order" } }
    template {
      metadata { labels = { app = "order" } }
      spec {
        container {
          name  = "order"
          image = var.order_image
          port { container_port = 8080 }
        }
      }
    }
  }
}

resource "kubernetes_service" "order" {
  metadata {
    name      = "order-service"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }
  spec {
    selector = { app = "order" }
    port {
      port        = 80
      target_port = 8080
    }
    type = "ClusterIP"
  }
}

# -------------------------
# Frontend
# -------------------------
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.staging.metadata[0].name
    labels = { app = "frontend" }
  }

  lifecycle { ignore_changes = [metadata[0].generation] }

  spec {
    replicas = 1
    selector { match_labels = { app = "frontend" } }
    template {
      metadata { labels = { app = "frontend" } }
      spec {
        container {
          name  = "frontend"
          image = var.frontend_image
          port { container_port = 3000 }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend-service"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }
  spec {
    selector = { app = "frontend" }
    port {
      port        = 80
      target_port = 3000
    }
    type = "LoadBalancer"
  }
}

# -------------------------
# Ingress for all services
# -------------------------
resource "kubernetes_ingress_v1" "staging_ingress" {
  metadata {
    name      = "staging-ingress"
    namespace = kubernetes_namespace.staging.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
    }
  }

  spec {
    rule {
      http {
        path {
          path     = "/customer"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.customer.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }

        path {
          path     = "/product"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.product.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }

        path {
          path     = "/order"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.order.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }

        path {
          path     = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
