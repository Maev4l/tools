locals {
  s3_origin_id = "tools-frontend"
}

resource "aws_cloudfront_origin_access_control" "origin_access_control" {
  name                              = "origin-access-control-tools-frontend"
  description                       = "CloudFront origin access control for Tools frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket" "frontend" {
  bucket        = local.domain_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "frontend_public_access" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "frontend_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "ForAnyValue:StringEquals"
      variable = "AWS:SourceArn"
      values   = ["${aws_cloudfront_distribution.frontend_distribution.arn}"]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_s3_policy.json
}

# Security headers for all responses
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "tools-security-headers"
  comment = "Security headers for Tools frontend"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"
      override                = true
    }
  }
}

resource "aws_cloudfront_distribution" "frontend_distribution" {
  comment = "CloudFront Distribution for Tools frontend"
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.origin_access_control.id
  }

  default_root_object = "index.html"
  enabled             = true
  is_ipv6_enabled     = true
  wait_for_deployment = false
  http_version        = "http2and3"
  aliases             = [local.domain_name]
  price_class         = "PriceClass_100" // Only in EU and North America

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  default_cache_behavior {
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    target_origin_id           = local.s3_origin_id
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" // Managed CachingOptimized policy
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
  }

  # SPA routing: return index.html for missing files
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = data.aws_acm_certificate.main_certificate.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}


