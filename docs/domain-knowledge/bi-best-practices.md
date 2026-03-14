# Business Intelligence Best Practices

## Power BI
- Use Import mode for datasets under 1GB, DirectQuery for larger
- Build a proper star schema semantic model
- Use DAX measures instead of calculated columns where possible
- Implement row-level security (RLS) when needed
- Use deployment pipelines for dev/test/prod promotion

## Tableau
- Use extracts for better performance
- Implement data source filters at the connection level
- Use parameters for dynamic filtering
- Follow the visual best practices guidelines
- Use Tableau Prep for data preparation

## General BI Standards
- Single source of truth for business metrics
- Document all calculated fields and measures
- Version control for BI assets where possible
- Performance test with realistic data volumes
- User acceptance testing before deployment
