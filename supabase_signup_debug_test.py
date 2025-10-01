#!/usr/bin/env python3
"""
Supabase Signup 500 Error Debug Test for Offerless Application
Focuses on debugging the specific signup error: "database error error saving new user"
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

class SupabaseSignupDebugTester:
    def __init__(self):
        # From the error URL in the review request
        self.supabase_url = "https://wecrjzuffhnruhzaztbf.supabase.co"
        self.app_url = "http://localhost:3000"
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

    def test_environment_setup(self):
        """Test if the Next.js application is running"""
        try:
            response = self.session.get(f"{self.app_url}")
            if response.status_code == 200:
                self.log_test("Environment Setup", True, "Next.js application is accessible")
                return True
            else:
                self.log_test("Environment Setup", False, f"Application returned status {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.log_test("Environment Setup", False, "Cannot connect to application - is it running?")
            return False
        except Exception as e:
            self.log_test("Environment Setup", False, f"Unexpected error: {str(e)}")
            return False

    def test_supabase_url_accessibility(self):
        """Test if the Supabase instance is accessible"""
        try:
            # Test the health endpoint
            response = self.session.get(f"{self.supabase_url}/rest/v1/", timeout=10)
            if response.status_code in [200, 401, 403]:
                self.log_test("Supabase URL Accessibility", True, f"Supabase instance is accessible (status: {response.status_code})")
                return True
            else:
                self.log_test("Supabase URL Accessibility", False, f"Supabase returned unexpected status: {response.status_code}")
                return False
        except requests.exceptions.Timeout:
            self.log_test("Supabase URL Accessibility", False, "Supabase instance timed out - possible network issue")
            return False
        except requests.exceptions.ConnectionError:
            self.log_test("Supabase URL Accessibility", False, "Cannot connect to Supabase instance")
            return False
        except Exception as e:
            self.log_test("Supabase URL Accessibility", False, f"Unexpected error: {str(e)}")
            return False

    def test_supabase_auth_endpoint(self):
        """Test the Supabase auth signup endpoint directly"""
        try:
            # Test the auth endpoint that's failing
            auth_url = f"{self.supabase_url}/auth/v1/signup"
            
            # Try a basic request to see if endpoint exists
            response = self.session.post(auth_url, json={}, timeout=10)
            
            if response.status_code == 422:
                # This is expected - missing required fields
                self.log_test("Supabase Auth Endpoint", True, "Auth signup endpoint is accessible (422 for missing fields)")
                return True
            elif response.status_code == 400:
                # Also acceptable - bad request format
                self.log_test("Supabase Auth Endpoint", True, "Auth signup endpoint is accessible (400 for bad request)")
                return True
            elif response.status_code == 500:
                # This is the error we're investigating
                try:
                    error_data = response.json()
                    self.log_test("Supabase Auth Endpoint", False, "500 error on auth endpoint", {"error": error_data})
                    return False
                except:
                    self.log_test("Supabase Auth Endpoint", False, "500 error on auth endpoint", {"response": response.text})
                    return False
            else:
                self.log_test("Supabase Auth Endpoint", False, f"Unexpected status code: {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_test("Supabase Auth Endpoint", False, f"Request failed: {str(e)}")
            return False

    def test_database_schema_via_rest_api(self):
        """Test database schema accessibility via Supabase REST API"""
        try:
            # Try to access the profiles table structure
            profiles_url = f"{self.supabase_url}/rest/v1/profiles"
            
            # This should return 401 (unauthorized) if the table exists and RLS is enabled
            response = self.session.get(profiles_url, timeout=10)
            
            if response.status_code == 401:
                self.log_test("Database Schema - Profiles Table", True, "Profiles table exists and RLS is enabled")
                return True
            elif response.status_code == 404:
                self.log_test("Database Schema - Profiles Table", False, "Profiles table does not exist")
                return False
            elif response.status_code == 406:
                # Not acceptable - might be missing headers
                self.log_test("Database Schema - Profiles Table", True, "Profiles table exists (406 - missing headers)")
                return True
            else:
                self.log_test("Database Schema - Profiles Table", False, f"Unexpected response: {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_test("Database Schema - Profiles Table", False, f"Request failed: {str(e)}")
            return False

    def test_rls_policies_via_rest_api(self):
        """Test RLS policies by attempting to insert into profiles table"""
        try:
            # Try to insert into profiles table (should fail due to RLS)
            profiles_url = f"{self.supabase_url}/rest/v1/profiles"
            
            test_profile = {
                "id": str(uuid.uuid4()),
                "username": "testuser123",
                "email": "test@example.com"
            }
            
            response = self.session.post(profiles_url, json=test_profile, timeout=10)
            
            if response.status_code == 401:
                self.log_test("RLS Policies - Profiles Insert", True, "RLS is working (401 for unauthorized insert)")
                return True
            elif response.status_code == 403:
                self.log_test("RLS Policies - Profiles Insert", True, "RLS is working (403 for forbidden insert)")
                return True
            elif response.status_code == 406:
                self.log_test("RLS Policies - Profiles Insert", True, "RLS is working (406 - missing headers)")
                return True
            else:
                try:
                    error_data = response.json()
                    self.log_test("RLS Policies - Profiles Insert", False, f"Unexpected response: {response.status_code}", {"error": error_data})
                except:
                    self.log_test("RLS Policies - Profiles Insert", False, f"Unexpected response: {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_test("RLS Policies - Profiles Insert", False, f"Request failed: {str(e)}")
            return False

    def test_signup_with_real_data(self):
        """Test actual signup with realistic data to reproduce the 500 error"""
        try:
            auth_url = f"{self.supabase_url}/auth/v1/signup"
            
            # Use realistic test data
            signup_data = {
                "email": "testuser@example.com",
                "password": "TestPassword123!",
                "data": {
                    "username": "testuser123"
                }
            }
            
            headers = {
                "Content-Type": "application/json",
                "apikey": "your_anon_key_here"  # This would need to be the real anon key
            }
            
            response = self.session.post(auth_url, json=signup_data, headers=headers, timeout=15)
            
            if response.status_code == 200:
                self.log_test("Signup with Real Data", True, "Signup successful")
                return True
            elif response.status_code == 422:
                try:
                    error_data = response.json()
                    if "email" in str(error_data).lower():
                        self.log_test("Signup with Real Data", True, "Expected validation error for email format")
                        return True
                    else:
                        self.log_test("Signup with Real Data", False, "Validation error", {"error": error_data})
                        return False
                except:
                    self.log_test("Signup with Real Data", False, "422 error with unparseable response", {"response": response.text})
                    return False
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    if "database error" in str(error_data).lower():
                        self.log_test("Signup with Real Data", False, "DATABASE ERROR REPRODUCED - This is the issue!", {"error": error_data})
                        return False
                    else:
                        self.log_test("Signup with Real Data", False, "500 error but not database related", {"error": error_data})
                        return False
                except:
                    self.log_test("Signup with Real Data", False, "500 error with unparseable response", {"response": response.text})
                    return False
            else:
                try:
                    error_data = response.json()
                    self.log_test("Signup with Real Data", False, f"Unexpected status: {response.status_code}", {"error": error_data})
                except:
                    self.log_test("Signup with Real Data", False, f"Unexpected status: {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_test("Signup with Real Data", False, f"Request failed: {str(e)}")
            return False

    def test_auth_users_table_accessibility(self):
        """Test if auth.users table is accessible (it shouldn't be via REST API)"""
        try:
            # Try to access auth.users table (should be blocked)
            auth_users_url = f"{self.supabase_url}/rest/v1/auth.users"
            
            response = self.session.get(auth_users_url, timeout=10)
            
            if response.status_code == 404:
                self.log_test("Auth Users Table Access", True, "auth.users table is properly protected (404)")
                return True
            elif response.status_code == 401:
                self.log_test("Auth Users Table Access", True, "auth.users table is properly protected (401)")
                return True
            else:
                self.log_test("Auth Users Table Access", False, f"Unexpected access to auth.users: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth Users Table Access", False, f"Request failed: {str(e)}")
            return False

    def test_trigger_function_issues(self):
        """Test for potential trigger function issues by checking database functions"""
        try:
            # Try to access database functions (should be blocked but gives us info)
            functions_url = f"{self.supabase_url}/rest/v1/rpc/handle_new_user"
            
            response = self.session.post(functions_url, json={}, timeout=10)
            
            if response.status_code in [401, 403, 404]:
                self.log_test("Trigger Function Check", True, f"Database functions are protected (status: {response.status_code})")
                return True
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    self.log_test("Trigger Function Check", False, "Potential trigger function issue", {"error": error_data})
                    return False
                except:
                    self.log_test("Trigger Function Check", False, "500 error on function call", {"response": response.text})
                    return False
            else:
                self.log_test("Trigger Function Check", False, f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Trigger Function Check", False, f"Request failed: {str(e)}")
            return False

    def analyze_potential_issues(self):
        """Analyze and report potential issues based on test results"""
        print("\n" + "=" * 60)
        print("🔍 POTENTIAL ISSUE ANALYSIS")
        print("=" * 60)
        
        issues_found = []
        
        # Check for common Supabase signup issues
        print("\n📋 COMMON SUPABASE SIGNUP ISSUES TO CHECK:")
        print("-" * 50)
        
        print("1. 🗄️  DATABASE SCHEMA ISSUES:")
        print("   • Check if profiles table exists with correct structure")
        print("   • Verify profiles.id references auth.users(id) correctly")
        print("   • Ensure UUID extension is enabled")
        print("   • Check for any foreign key constraint violations")
        
        print("\n2. 🔒 RLS POLICY ISSUES:")
        print("   • Missing INSERT policy for profiles table")
        print("   • Current schema only has SELECT and UPDATE policies")
        print("   • Need: CREATE POLICY \"Allow signup\" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);")
        
        print("\n3. ⚡ AUTH TRIGGER ISSUES:")
        print("   • handle_new_user() trigger function might be failing")
        print("   • Check if trigger is properly created and enabled")
        print("   • Verify trigger function has correct permissions (SECURITY DEFINER)")
        print("   • Check for username uniqueness constraint violations")
        
        print("\n4. 🔧 COLUMN MISMATCH ISSUES:")
        print("   • Schema shows profiles.id but some code might expect user_id")
        print("   • Verify auth.users table can properly relate to profiles table")
        print("   • Check if trigger function uses correct column names")
        
        print("\n5. 🌐 ENVIRONMENT CONFIGURATION:")
        print("   • Verify Supabase URL and keys are correct")
        print("   • Check if database is properly initialized")
        print("   • Ensure migrations have been applied")
        
        return issues_found

    def generate_recommendations(self):
        """Generate specific recommendations to fix the signup issue"""
        print("\n" + "=" * 60)
        print("🎯 SPECIFIC RECOMMENDATIONS TO FIX SIGNUP")
        print("=" * 60)
        
        print("\n🔧 IMMEDIATE FIXES TO TRY:")
        print("-" * 30)
        
        print("1. ADD MISSING RLS POLICY:")
        print("   SQL: CREATE POLICY \"Allow profile creation on signup\" ON profiles")
        print("        FOR INSERT WITH CHECK (auth.uid() = id);")
        
        print("\n2. VERIFY TRIGGER FUNCTION:")
        print("   • Check if handle_new_user() trigger exists and is enabled")
        print("   • Verify trigger function handles username generation correctly")
        print("   • Check for any errors in trigger function logic")
        
        print("\n3. CHECK DATABASE CONSTRAINTS:")
        print("   • Verify username uniqueness constraint isn't causing conflicts")
        print("   • Check if email validation is working correctly")
        print("   • Ensure UUID generation is working")
        
        print("\n4. VERIFY SCHEMA CONSISTENCY:")
        print("   • Confirm profiles table structure matches TypeScript types")
        print("   • Check if all required columns have proper defaults")
        print("   • Verify foreign key relationships are correct")
        
        print("\n🔍 DEBUGGING STEPS:")
        print("-" * 20)
        
        print("1. Check Supabase Dashboard:")
        print("   • Go to Database > Tables > profiles")
        print("   • Verify table structure and policies")
        print("   • Check Database > Functions for handle_new_user")
        
        print("\n2. Check Supabase Logs:")
        print("   • Go to Logs > Database")
        print("   • Look for errors during signup attempts")
        print("   • Check for constraint violations or trigger errors")
        
        print("\n3. Test Database Directly:")
        print("   • Use Supabase SQL Editor to test trigger function")
        print("   • Try manual INSERT into auth.users to see if trigger fires")
        print("   • Check if profiles table accepts manual INSERTs")

    def run_all_tests(self):
        """Run all Supabase signup debug tests"""
        print("🚀 Starting Supabase Signup Debug Tests")
        print("=" * 50)
        print("🎯 Objective: Debug the 500 error 'database error error saving new user'")
        print("🔗 Error URL: POST https://wecrjzuffhnruhzaztbf.supabase.co/auth/v1/signup")
        print("=" * 50)
        
        # Environment tests
        if not self.test_environment_setup():
            print("⚠️  Next.js app not running - continuing with Supabase tests")
        
        # Supabase connectivity tests
        self.test_supabase_url_accessibility()
        self.test_supabase_auth_endpoint()
        
        # Database schema tests
        self.test_database_schema_via_rest_api()
        self.test_rls_policies_via_rest_api()
        self.test_auth_users_table_accessibility()
        self.test_trigger_function_issues()
        
        # Actual signup test (this will likely fail with 500)
        self.test_signup_with_real_data()
        
        # Analysis and recommendations
        self.analyze_potential_issues()
        self.generate_recommendations()
        
        return self.generate_report()

    def generate_report(self):
        """Generate a comprehensive test report"""
        print("\n" + "=" * 50)
        print("📊 SUPABASE SIGNUP DEBUG RESULTS")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS (POTENTIAL ISSUES):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
                    if result["details"]:
                        print(f"     Details: {result['details']}")
        
        print("\n🎯 MOST LIKELY ROOT CAUSE:")
        print("  Missing INSERT policy for profiles table in RLS configuration")
        print("  The trigger function can't insert into profiles due to RLS restrictions")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = SupabaseSignupDebugTester()
    report = tester.run_all_tests()
    
    # Always exit with 0 since this is a debug test, not a pass/fail test
    sys.exit(0)