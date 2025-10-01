variable "backend_image" {
  description = "Backend image tag from ACR"
  type        = string
}

variable "frontend_image" {
  description = "Frontend image tag from ACR"
  type        = string
}

variable "run_id" {
  description = "GitHub run ID to make namespace unique"
  type        = string
}
