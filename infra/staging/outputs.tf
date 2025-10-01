output "frontend_url" {
  value = kubernetes_service.frontend.status[0].load_balancer[0].ingress[0].ip
}

output "staging_ingress_ip" {
  value = kubernetes_ingress_v1.staging_ingress.status[0].load_balancer[0].ingress[0].ip
}
