variable "customer_image" {
  type        = string
  description = "Customer service image"
}

variable "product_image" {
  type        = string
  description = "Product service image"
}

variable "order_image" {
  type        = string
  description = "Order service image"
}

variable "frontend_image" {
  type        = string
  description = "Frontend image"
}

variable "run_id" {
  type        = string
  description = "GitHub run ID for unique namespace"
}
