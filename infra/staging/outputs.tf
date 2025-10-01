output "backend_url" {
  value = kubernetes_service.backend.status[0].load_balancer[0].ingress[0].ip
}

output "frontend_url" {
  value = kubernetes_service.frontend.status[0].load_balancer[0].ingress[0].ip
}
