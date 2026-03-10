# Routing to the web client (IPv4)
resource "aws_route53_record" "frontend_ipv4" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    zone_id                = aws_cloudfront_distribution.frontend_distribution.hosted_zone_id
    evaluate_target_health = "false"
    name                   = aws_cloudfront_distribution.frontend_distribution.domain_name
  }
}

# Routing to the web client (IPv6)
resource "aws_route53_record" "frontend_ipv6" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.domain_name
  type    = "AAAA"

  alias {
    zone_id                = aws_cloudfront_distribution.frontend_distribution.hosted_zone_id
    evaluate_target_health = "false"
    name                   = aws_cloudfront_distribution.frontend_distribution.domain_name
  }
}
