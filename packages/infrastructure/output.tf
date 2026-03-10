output "frontendBucket" {
  value = aws_s3_bucket.frontend.id
}

output "frontendDistribution" {
  value = aws_cloudfront_distribution.frontend_distribution.id
}
