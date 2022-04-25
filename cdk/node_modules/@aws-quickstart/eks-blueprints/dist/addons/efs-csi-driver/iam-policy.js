"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfsDriverPolicyDocument = void 0;
const EfsDriverPolicyDocument = () => {
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "elasticfilesystem:DescribeAccessPoints",
                    "elasticfilesystem:DescribeFileSystems"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticfilesystem:CreateAccessPoint"
                ],
                "Resource": "*",
                "Condition": {
                    "StringLike": {
                        "aws:RequestTag/efs.csi.aws.com/cluster": "true"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": "elasticfilesystem:DeleteAccessPoint",
                "Resource": "*",
                "Condition": {
                    "StringEquals": {
                        "aws:ResourceTag/efs.csi.aws.com/cluster": "true"
                    }
                }
            }
        ]
    };
};
exports.EfsDriverPolicyDocument = EfsDriverPolicyDocument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvZWZzLWNzaS1kcml2ZXIvaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLHVCQUF1QixHQUFHLEdBQUcsRUFBRTtJQUMxQyxPQUFPO1FBQ0wsU0FBUyxFQUFFLFlBQVk7UUFDdkIsV0FBVyxFQUFFO1lBQ1g7Z0JBQ0UsUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDUix3Q0FBd0M7b0JBQ3hDLHVDQUF1QztpQkFDeEM7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7YUFDaEI7WUFDRDtnQkFDRSxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFO29CQUNSLHFDQUFxQztpQkFDdEM7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsV0FBVyxFQUFFO29CQUNYLFlBQVksRUFBRTt3QkFDWix3Q0FBd0MsRUFBRSxNQUFNO3FCQUNqRDtpQkFDRjthQUNGO1lBQ0Q7Z0JBQ0UsUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRSxxQ0FBcUM7Z0JBQy9DLFVBQVUsRUFBRSxHQUFHO2dCQUNmLFdBQVcsRUFBRTtvQkFDWCxjQUFjLEVBQUU7d0JBQ2QseUNBQXlDLEVBQUUsTUFBTTtxQkFDbEQ7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQztBQXBDVyxRQUFBLHVCQUF1QiwyQkFvQ2xDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEVmc0RyaXZlclBvbGljeURvY3VtZW50ID0gKCkgPT4ge1xuICByZXR1cm4ge1xuICAgIFwiVmVyc2lvblwiOiBcIjIwMTItMTAtMTdcIixcbiAgICBcIlN0YXRlbWVudFwiOiBbXG4gICAgICB7XG4gICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgIFwiZWxhc3RpY2ZpbGVzeXN0ZW06RGVzY3JpYmVBY2Nlc3NQb2ludHNcIixcbiAgICAgICAgICBcImVsYXN0aWNmaWxlc3lzdGVtOkRlc2NyaWJlRmlsZVN5c3RlbXNcIlxuICAgICAgICBdLFxuICAgICAgICBcIlJlc291cmNlXCI6IFwiKlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICBcImVsYXN0aWNmaWxlc3lzdGVtOkNyZWF0ZUFjY2Vzc1BvaW50XCJcbiAgICAgICAgXSxcbiAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL2Vmcy5jc2kuYXdzLmNvbS9jbHVzdGVyXCI6IFwidHJ1ZVwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgIFwiQWN0aW9uXCI6IFwiZWxhc3RpY2ZpbGVzeXN0ZW06RGVsZXRlQWNjZXNzUG9pbnRcIixcbiAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IHtcbiAgICAgICAgICAgIFwiYXdzOlJlc291cmNlVGFnL2Vmcy5jc2kuYXdzLmNvbS9jbHVzdGVyXCI6IFwidHJ1ZVwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgXVxuICB9O1xufTsiXX0=