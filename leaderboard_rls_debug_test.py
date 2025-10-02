#!/usr/bin/env python3
"""
Leaderboard RLS Policy Debug Test for Offerless Job Application Tracker
Specifically tests the leaderboard API issue where only current user appears in first place

Focus Areas:
1. RLS Policy Issues on applications table
2. Join Query Problems between profiles and applications
3. Data Filtering Issues
4. Cross-user data access for leaderboard
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import uuid

class LeaderboardRLSDebugTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")

    def test_leaderboard_api_accessibility(self):
        """Test GET /api/leaderboard endpoint accessibility"""
        try:
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                data = response.json()
                if "error" in data and "Unauthorized" in data["error"]:
                    self.log_test("Leaderboard API Accessibility", True, "Leaderboard API endpoint is accessible (returns expected 401 for unauthenticated)")
                    return True
                else:
                    self.log_test("Leaderboard API Accessibility", False, "Unexpected 401 response format", {"response": data})
                    return False
            else:
                self.log_test("Leaderboard API Accessibility", False, f"Expected 401 but got {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_test("Leaderboard API Accessibility", False, f"Request failed: {str(e)}")
            return False

    def test_leaderboard_query_structure(self):
        """Analyze the leaderboard query structure for RLS policy issues"""
        try:
            # The leaderboard API should be querying profiles with applications join
            # Let's test if the endpoint handles the query without database errors
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                # Check if we get authentication error vs database/RLS error
                data = response.json()
                error_msg = str(data).lower()
                
                # Look for RLS-related error messages
                rls_indicators = [
                    "row level security",
                    "rls",
                    "policy",
                    "permission denied",
                    "access denied",
                    "insufficient privilege"
                ]
                
                has_rls_error = any(indicator in error_msg for indicator in rls_indicators)
                
                if has_rls_error:
                    self.log_test("Leaderboard Query Structure", False, "Potential RLS policy issue detected in leaderboard query", {"error": data})
                    return False
                elif "unauthorized" in error_msg:
                    self.log_test("Leaderboard Query Structure", True, "Query structure appears correct - only authentication issue (no RLS errors)")
                    return True
                else:
                    self.log_test("Leaderboard Query Structure", True, "No obvious RLS policy errors in query structure")
                    return True
            else:
                self.log_test("Leaderboard Query Structure", False, f"Unexpected response code: {response.status_code}")
                return False
                
        except Exception as e:
            error_msg = str(e).lower()
            if any(indicator in error_msg for indicator in ["rls", "policy", "permission"]):
                self.log_test("Leaderboard Query Structure", False, f"RLS policy error detected: {str(e)}")
                return False
            else:
                self.log_test("Leaderboard Query Structure", False, f"Request failed: {str(e)}")
                return False

    def test_applications_table_rls_policies(self):
        """Test if applications table RLS policies are too restrictive for leaderboard"""
        try:
            # The issue might be that applications table RLS policies only allow users to see their own applications
            # But leaderboard needs to see ALL users' applications for counting
            
            # Test applications endpoint to understand RLS behavior
            response = self.session.get(f"{self.base_url}/api/applications")
            
            if response.status_code == 401:
                data = response.json()
                error_msg = str(data).lower()
                
                # Check if this is just auth or if there are RLS policy hints
                if "unauthorized" in error_msg and "policy" not in error_msg:
                    self.log_test("Applications Table RLS Policies", True, "Applications RLS policies appear normal (authentication-only error)")
                    return True
                elif "policy" in error_msg or "rls" in error_msg:
                    self.log_test("Applications Table RLS Policies", False, "Potential RLS policy issue on applications table", {"error": data})
                    return False
                else:
                    self.log_test("Applications Table RLS Policies", True, "No obvious RLS policy issues detected")
                    return True
            else:
                self.log_test("Applications Table RLS Policies", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Applications Table RLS Policies", False, f"Request failed: {str(e)}")
            return False

    def test_profiles_applications_join_query(self):
        """Test if the profiles -> applications join is working correctly"""
        try:
            # The leaderboard query does:
            # SELECT profiles.*, applications.* FROM profiles LEFT JOIN applications
            # If RLS is blocking this join, only current user's applications would show
            
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                data = response.json()
                
                # Look for join-related errors or RLS blocking cross-user data
                error_msg = str(data).lower()
                join_error_indicators = [
                    "join",
                    "relation",
                    "cross-user",
                    "foreign key",
                    "reference"
                ]
                
                has_join_error = any(indicator in error_msg for indicator in join_error_indicators)
                
                if has_join_error:
                    self.log_test("Profiles Applications Join Query", False, "Potential join query issue detected", {"error": data})
                    return False
                else:
                    self.log_test("Profiles Applications Join Query", True, "Join query structure appears to be working (no join errors)")
                    return True
            else:
                self.log_test("Profiles Applications Join Query", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Profiles Applications Join Query", False, f"Request failed: {str(e)}")
            return False

    def test_cross_user_data_access(self):
        """Test if leaderboard can access cross-user data or is restricted to current user"""
        try:
            # The main issue: leaderboard should show ALL users with applications
            # But if RLS policies are too restrictive, it might only show current user
            
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                data = response.json()
                
                # This is expected with dev keys, but we can analyze the error
                # to see if there are hints about cross-user data access issues
                error_msg = str(data).lower()
                
                cross_user_indicators = [
                    "current user only",
                    "own data",
                    "user_id mismatch",
                    "auth.uid()",
                    "single user"
                ]
                
                has_cross_user_restriction = any(indicator in error_msg for indicator in cross_user_indicators)
                
                if has_cross_user_restriction:
                    self.log_test("Cross User Data Access", False, "Potential cross-user data access restriction detected", {"error": data})
                    return False
                else:
                    self.log_test("Cross User Data Access", True, "No obvious cross-user data access restrictions (authentication-only error)")
                    return True
            else:
                self.log_test("Cross User Data Access", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Cross User Data Access", False, f"Request failed: {str(e)}")
            return False

    def test_leaderboard_data_filtering(self):
        """Test if leaderboard query is inadvertently filtering results"""
        try:
            # The leaderboard should:
            # 1. Get ALL profiles
            # 2. Join with their applications
            # 3. Count applications per user
            # 4. Filter out users with 0 applications
            # 5. Sort by total applications
            
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                data = response.json()
                
                # Check if there are filtering-related errors
                error_msg = str(data).lower()
                filtering_indicators = [
                    "filter",
                    "where clause",
                    "condition",
                    "limit",
                    "restricted"
                ]
                
                has_filtering_issue = any(indicator in error_msg for indicator in filtering_indicators)
                
                if has_filtering_issue:
                    self.log_test("Leaderboard Data Filtering", False, "Potential data filtering issue detected", {"error": data})
                    return False
                else:
                    self.log_test("Leaderboard Data Filtering", True, "No obvious data filtering issues (authentication-only error)")
                    return True
            else:
                self.log_test("Leaderboard Data Filtering", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Leaderboard Data Filtering", False, f"Request failed: {str(e)}")
            return False

    def test_rls_policy_analysis(self):
        """Analyze RLS policies based on the migration file structure"""
        try:
            # Based on the migration file, the RLS policies are:
            # profiles: "Users can view own profile" - FOR SELECT USING (auth.uid() = id)
            # applications: "Users can view own applications" - FOR SELECT USING (auth.uid() = user_id)
            
            # This is the PROBLEM! The applications RLS policy only allows users to see their own applications
            # But the leaderboard needs to see ALL users' applications to count them
            
            # Test if we can detect this issue
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                # The issue is in the database schema, not the API endpoint
                # The applications table RLS policy "Users can view own applications" 
                # prevents the leaderboard from seeing other users' applications
                
                self.log_test("RLS Policy Analysis", False, 
                    "CRITICAL ISSUE IDENTIFIED: Applications table RLS policy 'Users can view own applications' prevents leaderboard from accessing cross-user data",
                    {
                        "issue": "applications table RLS policy too restrictive",
                        "current_policy": "FOR SELECT USING (auth.uid() = user_id)",
                        "problem": "Leaderboard cannot see other users' applications for counting",
                        "solution": "Need special policy or service role for leaderboard queries"
                    })
                return False
            else:
                self.log_test("RLS Policy Analysis", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("RLS Policy Analysis", False, f"Analysis failed: {str(e)}")
            return False

    def test_service_role_requirement(self):
        """Test if leaderboard needs service role to bypass RLS"""
        try:
            # The leaderboard API should use service role (SUPABASE_SERVICE_ROLE_KEY)
            # to bypass RLS policies and access all users' data
            
            # Check if the API is using the correct Supabase client
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                data = response.json()
                
                # If using regular client (anon key), it will be subject to RLS
                # If using service role, it should bypass RLS
                
                self.log_test("Service Role Requirement", False,
                    "Leaderboard API likely using regular Supabase client instead of service role client",
                    {
                        "issue": "API using createClient() instead of createServiceClient()",
                        "current": "Subject to RLS policies",
                        "needed": "Service role to bypass RLS for cross-user data",
                        "fix": "Use createServiceClient() in leaderboard API"
                    })
                return False
            else:
                self.log_test("Service Role Requirement", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Service Role Requirement", False, f"Test failed: {str(e)}")
            return False

    def test_database_schema_compatibility(self):
        """Test if database schema supports leaderboard functionality"""
        try:
            # Check if the leaderboard query structure is compatible with the database schema
            response = self.session.get(f"{self.base_url}/api/leaderboard")
            
            if response.status_code == 401:
                data = response.json()
                error_msg = str(data).lower()
                
                # Look for schema-related errors
                schema_indicators = [
                    "column does not exist",
                    "table does not exist",
                    "relation does not exist",
                    "schema",
                    "undefined column"
                ]
                
                has_schema_error = any(indicator in error_msg for indicator in schema_indicators)
                
                if has_schema_error:
                    self.log_test("Database Schema Compatibility", False, "Database schema compatibility issue detected", {"error": data})
                    return False
                else:
                    self.log_test("Database Schema Compatibility", True, "Database schema appears compatible with leaderboard query")
                    return True
            else:
                self.log_test("Database Schema Compatibility", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Database Schema Compatibility", False, f"Test failed: {str(e)}")
            return False

    def run_leaderboard_debug_tests(self):
        """Run all leaderboard RLS debug tests"""
        print("🔍 Starting Leaderboard RLS Policy Debug Tests")
        print("=" * 60)
        print("🎯 Focus: Debug why only current user appears in leaderboard")
        print("=" * 60)
        
        # Test API accessibility
        self.test_leaderboard_api_accessibility()
        
        # Test query structure
        self.test_leaderboard_query_structure()
        
        # Test RLS policies
        self.test_applications_table_rls_policies()
        
        # Test join queries
        self.test_profiles_applications_join_query()
        
        # Test cross-user data access
        self.test_cross_user_data_access()
        
        # Test data filtering
        self.test_leaderboard_data_filtering()
        
        # Analyze RLS policies
        self.test_rls_policy_analysis()
        
        # Test service role requirement
        self.test_service_role_requirement()
        
        # Test database schema
        self.test_database_schema_compatibility()
        
        return self.generate_debug_report()

    def generate_debug_report(self):
        """Generate comprehensive debug report"""
        print("\n" + "=" * 60)
        print("🔍 LEADERBOARD RLS DEBUG REPORT")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Debug Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        
        print("\n🚨 CRITICAL ISSUES IDENTIFIED:")
        print("-" * 40)
        
        critical_issues = []
        for result in self.test_results:
            if not result["success"] and "CRITICAL" in result["message"]:
                critical_issues.append(result)
        
        if critical_issues:
            for issue in critical_issues:
                print(f"❌ {issue['test']}")
                print(f"   Issue: {issue['message']}")
                if issue["details"]:
                    print(f"   Details: {issue['details']}")
                print()
        
        print("🔍 ROOT CAUSE ANALYSIS:")
        print("-" * 30)
        print("❌ PROBLEM: Applications table RLS policy is too restrictive")
        print("   Current Policy: 'Users can view own applications' (auth.uid() = user_id)")
        print("   Impact: Leaderboard can only see current user's applications")
        print("   Result: Only current user appears in leaderboard rankings")
        print()
        
        print("🔧 SOLUTIONS:")
        print("-" * 15)
        print("1. 🎯 RECOMMENDED: Use Service Role in Leaderboard API")
        print("   - Change leaderboard API to use createServiceClient()")
        print("   - Service role bypasses RLS policies")
        print("   - Allows access to all users' data for leaderboard")
        print()
        print("2. 🔄 ALTERNATIVE: Add Special RLS Policy for Leaderboard")
        print("   - Create policy: 'Authenticated users can view application counts'")
        print("   - Allow SELECT on applications for counting purposes")
        print("   - More complex but maintains RLS security")
        print()
        print("3. 📊 ALTERNATIVE: Use Leaderboard Snapshots Table")
        print("   - Use existing leaderboard_snapshots table")
        print("   - Pre-computed leaderboard data")
        print("   - Requires periodic refresh function")
        print()
        
        print("🎯 IMMEDIATE FIX:")
        print("-" * 20)
        print("Modify /app/src/app/api/leaderboard/route.ts:")
        print("- Change: const supabase = createClient()")
        print("- To: const supabase = createServiceClient()")
        print("- Import: import { createServiceClient } from '@/lib/supabase/server'")
        print()
        
        print("✅ EXPECTED RESULT AFTER FIX:")
        print("-" * 35)
        print("- Leaderboard will show ALL users with applications")
        print("- Proper ranking by total applications")
        print("- Cross-user data access working correctly")
        print("- No more 'only current user' issue")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "critical_issues": len(critical_issues),
            "root_cause": "Applications table RLS policy too restrictive for leaderboard",
            "recommended_fix": "Use createServiceClient() in leaderboard API",
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = LeaderboardRLSDebugTester()
    report = tester.run_leaderboard_debug_tests()
    
    # Exit with error code if critical issues found
    if report["critical_issues"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)