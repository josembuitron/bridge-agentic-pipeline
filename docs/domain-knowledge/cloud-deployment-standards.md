# Cloud Deployment Standards

## Azure Deployment
- Use Azure Resource Manager (ARM) templates or Terraform
- Follow naming conventions: {org}-{env}-{service}-{region}
- Use managed identities over service principals where possible
- Enable diagnostic logging on all resources
- Use Azure Key Vault for secrets management

## AWS Deployment
- Use CloudFormation or Terraform
- Follow tagging standards for cost allocation
- Use IAM roles with least privilege
- Enable CloudTrail and CloudWatch
- Use AWS Secrets Manager or Parameter Store

## General Standards
- Infrastructure as Code (IaC) for all environments
- Separate environments: dev, staging, production
- Use CI/CD pipelines for deployments
- Implement health checks and monitoring
- Document runbooks for operational procedures
