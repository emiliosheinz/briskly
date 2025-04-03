resource "aws_ssm_parameter" "s3_access_key" {
  name        = "/briskly/${var.env}/AWS_S3_ACCESS_KEY_ID"
  description = "S3 access key for ${var.env} environment"
  type        = "SecureString"
  value       = aws_iam_access_key.s3_user_key.id
}

resource "aws_ssm_parameter" "s3_secret_key" {
  name        = "/briskly/${var.env}/AWS_S3_SECRET_ACCESS_KEY"
  description = "S3 secret key for ${var.env} environment"
  type        = "SecureString"
  value       = aws_iam_access_key.s3_user_key.secret
}
