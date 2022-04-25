"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarpenterControllerPolicy = void 0;
exports.KarpenterControllerPolicy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:CreateLaunchTemplate",
                "ec2:CreateFleet",
                "ec2:RunInstances",
                "ec2:CreateTags",
                "iam:PassRole",
                "ec2:TerminateInstances",
                "ec2:DescribeLaunchTemplates",
                "ec2:DescribeInstances",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSubnets",
                "ec2:DescribeInstanceTypes",
                "ec2:DescribeInstanceTypeOfferings",
                "ec2:DescribeAvailabilityZones",
                "ssm:GetParameter",
            ],
            "Resource": "*"
        }
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2FkZG9ucy9rYXJwZW50ZXIvaWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEseUJBQXlCLEdBQUc7SUFDdkMsU0FBUyxFQUFFLFlBQVk7SUFDdkIsV0FBVyxFQUFFO1FBQ1Q7WUFDSSxRQUFRLEVBQUUsT0FBTztZQUNqQixRQUFRLEVBQUU7Z0JBQ04sMEJBQTBCO2dCQUMxQixpQkFBaUI7Z0JBQ2pCLGtCQUFrQjtnQkFDbEIsZ0JBQWdCO2dCQUNoQixjQUFjO2dCQUNkLHdCQUF3QjtnQkFDeEIsNkJBQTZCO2dCQUM3Qix1QkFBdUI7Z0JBQ3ZCLDRCQUE0QjtnQkFDNUIscUJBQXFCO2dCQUNyQiwyQkFBMkI7Z0JBQzNCLG1DQUFtQztnQkFDbkMsK0JBQStCO2dCQUMvQixrQkFBa0I7YUFDckI7WUFDRCxVQUFVLEVBQUUsR0FBRztTQUNsQjtLQUNKO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBLYXJwZW50ZXJDb250cm9sbGVyUG9saWN5ID0ge1xuICBcIlZlcnNpb25cIjogXCIyMDEyLTEwLTE3XCIsXG4gIFwiU3RhdGVtZW50XCI6IFtcbiAgICAgIHtcbiAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICBcImVjMjpDcmVhdGVMYXVuY2hUZW1wbGF0ZVwiLFxuICAgICAgICAgICAgICBcImVjMjpDcmVhdGVGbGVldFwiLFxuICAgICAgICAgICAgICBcImVjMjpSdW5JbnN0YW5jZXNcIixcbiAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVGFnc1wiLFxuICAgICAgICAgICAgICBcImlhbTpQYXNzUm9sZVwiLFxuICAgICAgICAgICAgICBcImVjMjpUZXJtaW5hdGVJbnN0YW5jZXNcIixcbiAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVMYXVuY2hUZW1wbGF0ZXNcIixcbiAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnN0YW5jZXNcIixcbiAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVTZWN1cml0eUdyb3Vwc1wiLFxuICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVN1Ym5ldHNcIixcbiAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnN0YW5jZVR5cGVzXCIsXG4gICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW5zdGFuY2VUeXBlT2ZmZXJpbmdzXCIsXG4gICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlQXZhaWxhYmlsaXR5Wm9uZXNcIixcbiAgICAgICAgICAgICAgXCJzc206R2V0UGFyYW1ldGVyXCIsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBcIlJlc291cmNlXCI6IFwiKlwiXG4gICAgICB9XG4gIF1cbn07Il19