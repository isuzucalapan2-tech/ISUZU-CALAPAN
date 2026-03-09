# SA Rotation Refactoring TODO

## Task: Separate cards in SA_Rotation into different files in AfterSales folder

### Plan:
1. [x] Analyze SA_Rotation.vue to understand the 5 main card sections
2. [ ] Create RetailOrdersCard.vue - First card for PR Orders management
3. [ ] Create ServiceAdvisorsCard.vue - Second card for Service Advisors with fairness dashboard
4. [ ] Create AssignmentCard.vue - Third card for SA Assign to RO's
5. [ ] Create PerformedRetailOrders.vue - Bottom left table (Active assignments)
6. [ ] Create AnalyticsHistory.vue - Bottom right table (History & Analytics)
7. [ ] Update SA_Rotation.vue to import and render these components as parent

### Components Structure:
- **SA_Rotation.vue** (Parent) - Main container with layout grid
- **RetailOrdersCard.vue** - Card 1: PR Orders management
- **ServiceAdvisorsCard.vue** - Card 2: Service Advisors with fairness stats
- **AssignmentCard.vue** - Card 3: SA Assignment to RO's
- **PerformedRetailOrders.vue** - Table: Active assignments
- **AnalyticsHistory.vue** - Table: History & Analytics

