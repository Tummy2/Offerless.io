#!/usr/bin/env python3
"""
Focused Validation Test for Offerless Application
Tests company URL validation fixes and core API accessibility
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any

class OfferlessValidationTester:
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

    def test_company_url_empty_string(self):
        """Test that empty company_url is accepted"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "company_url": "",  # Empty string should be accepted
                "location_kind": "remote"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            # We expect 401 (unauthorized) since we're not authenticated
            # This means validation passed and we reached auth check
            if response.status_code == 401:
                self.log_test("Company URL - Empty String", True, "Empty company_url accepted (validation passed, auth check reached)")
                return True
            elif response.status_code == 400:
                try:
                    data = response.json()
                    self.log_test("Company URL - Empty String", False, "Empty company_url rejected by validation", {"response": data})
                    return False
                except:
                    self.log_test("Company URL - Empty String", False, "400 error with invalid JSON response")
                    return False
            else:
                self.log_test("Company URL - Empty String", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Company URL - Empty String", False, f"Request failed: {str(e)}")
            return False

    def test_company_url_valid_https(self):
        """Test that valid HTTPS URLs are accepted"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "company_url": "https://testcompany.com",  # Valid HTTPS URL
                "location_kind": "remote"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("Company URL - Valid HTTPS", True, "Valid HTTPS URL accepted (validation passed, auth check reached)")
                return True
            elif response.status_code == 400:
                try:
                    data = response.json()
                    self.log_test("Company URL - Valid HTTPS", False, "Valid HTTPS URL rejected by validation", {"response": data})
                    return False
                except:
                    self.log_test("Company URL - Valid HTTPS", False, "400 error with invalid JSON response")
                    return False
            else:
                self.log_test("Company URL - Valid HTTPS", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Company URL - Valid HTTPS", False, f"Request failed: {str(e)}")
            return False

    def test_company_url_valid_http(self):
        """Test that valid HTTP URLs are accepted"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "company_url": "http://testcompany.com",  # Valid HTTP URL
                "location_kind": "remote"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("Company URL - Valid HTTP", True, "Valid HTTP URL accepted (validation passed, auth check reached)")
                return True
            elif response.status_code == 400:
                try:
                    data = response.json()
                    self.log_test("Company URL - Valid HTTP", False, "Valid HTTP URL rejected by validation", {"response": data})
                    return False
                except:
                    self.log_test("Company URL - Valid HTTP", False, "400 error with invalid JSON response")
                    return False
            else:
                self.log_test("Company URL - Valid HTTP", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Company URL - Valid HTTP", False, f"Request failed: {str(e)}")
            return False

    def test_company_url_invalid_format(self):
        """Test that invalid URLs are rejected"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "company_url": "not-a-valid-url",  # Invalid URL format
                "location_kind": "remote"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 400:
                try:
                    data = response.json()
                    if "error" in data and ("validation" in data["error"].lower() or "url" in data["error"].lower()):
                        self.log_test("Company URL - Invalid Format", True, "Invalid URL properly rejected by validation")
                        return True
                    else:
                        self.log_test("Company URL - Invalid Format", False, "400 error but not validation-related", {"response": data})
                        return False
                except:
                    self.log_test("Company URL - Invalid Format", False, "400 error with invalid JSON response")
                    return False
            elif response.status_code == 401:
                self.log_test("Company URL - Invalid Format", False, "Invalid URL was accepted (should be rejected by validation)")
                return False
            else:
                self.log_test("Company URL - Invalid Format", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Company URL - Invalid Format", False, f"Request failed: {str(e)}")
            return False

    def test_company_url_missing_field(self):
        """Test that missing company_url field is accepted (optional)"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "location_kind": "remote"
                # No company_url field - should be optional
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("Company URL - Missing Field", True, "Missing company_url accepted (validation passed, auth check reached)")
                return True
            elif response.status_code == 400:
                try:
                    data = response.json()
                    self.log_test("Company URL - Missing Field", False, "Missing company_url rejected by validation", {"response": data})
                    return False
                except:
                    self.log_test("Company URL - Missing Field", False, "400 error with invalid JSON response")
                    return False
            else:
                self.log_test("Company URL - Missing Field", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Company URL - Missing Field", False, f"Request failed: {str(e)}")
            return False

    def test_api_applications_get(self):
        """Test GET /api/applications endpoint accessibility"""
        try:
            response = self.session.get(f"{self.base_url}/api/applications")
            
            if response.status_code == 401:
                data = response.json()
                if "error" in data and "Unauthorized" in data["error"]:
                    self.log_test("API GET /api/applications", True, "Endpoint accessible - returns expected 401 for unauthorized")
                    return True
                else:
                    self.log_test("API GET /api/applications", False, "Unexpected 401 response format", {"response": data})
                    return False
            else:
                self.log_test("API GET /api/applications", False, f"Expected 401 but got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API GET /api/applications", False, f"Request failed: {str(e)}")
            return False

    def test_api_applications_post(self):
        """Test POST /api/applications endpoint accessibility"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "company_url": "https://testcompany.com",
                "location_kind": "remote"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("API POST /api/applications", True, "Endpoint accessible - validation passed, returns expected 401 for unauthorized")
                return True
            elif response.status_code == 400:
                try:
                    data = response.json()
                    self.log_test("API POST /api/applications", False, "Validation error before auth check", {"response": data})
                    return False
                except:
                    self.log_test("API POST /api/applications", False, "400 error with invalid JSON response")
                    return False
            else:
                self.log_test("API POST /api/applications", False, f"Expected 401 but got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API POST /api/applications", False, f"Request failed: {str(e)}")
            return False

    def test_z_union_schema_validation(self):
        """Test that the z.union approach for company_url works correctly"""
        test_cases = [
            {"company_url": "", "description": "empty string"},
            {"company_url": "https://example.com", "description": "valid HTTPS URL"},
            {"company_url": "http://example.com", "description": "valid HTTP URL"},
            # Missing company_url field tested separately
        ]
        
        all_passed = True
        
        for i, test_case in enumerate(test_cases):
            try:
                test_application = {
                    "company": "Test Company",
                    "job_title": "Software Engineer",
                    "applied_at": "2024-01-15",
                    "status": "applied",
                    "location_kind": "remote"
                }
                test_application.update(test_case)
                
                response = self.session.post(
                    f"{self.base_url}/api/applications",
                    json=test_application,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code != 401:
                    self.log_test(f"Z.Union Schema - Case {i+1}", False, f"Failed for {test_case['description']}: expected 401, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Z.Union Schema - Case {i+1}", False, f"Request failed for {test_case['description']}: {str(e)}")
                all_passed = False
        
        if all_passed:
            self.log_test("Z.Union Schema Validation", True, "All z.union validation cases passed")
            return True
        else:
            return False

    def run_focused_tests(self):
        """Run focused validation tests"""
        print("🎯 Starting Focused Validation Tests for Offerless")
        print("=" * 55)
        print("Focus: Company URL validation fixes and API accessibility")
        print()
        
        # Company URL Validation Tests
        print("🔍 Testing Company URL Validation:")
        print("-" * 35)
        self.test_company_url_empty_string()
        self.test_company_url_valid_https()
        self.test_company_url_valid_http()
        self.test_company_url_invalid_format()
        self.test_company_url_missing_field()
        
        print()
        print("🌐 Testing API Endpoint Accessibility:")
        print("-" * 38)
        self.test_api_applications_get()
        self.test_api_applications_post()
        
        print()
        print("⚙️  Testing Validation Schema:")
        print("-" * 28)
        self.test_z_union_schema_validation()
        
        return self.generate_focused_report()

    def generate_focused_report(self):
        """Generate focused test report"""
        print("\n" + "=" * 55)
        print("📊 FOCUSED VALIDATION TEST RESULTS")
        print("=" * 55)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
                    if result["details"]:
                        print(f"     Details: {result['details']}")
        
        print("\n🎯 VALIDATION TEST SUMMARY:")
        company_url_tests = [r for r in self.test_results if "Company URL" in r["test"]]
        api_tests = [r for r in self.test_results if "API" in r["test"]]
        schema_tests = [r for r in self.test_results if "Schema" in r["test"]]
        
        company_url_passed = sum(1 for r in company_url_tests if r["success"])
        api_passed = sum(1 for r in api_tests if r["success"])
        schema_passed = sum(1 for r in schema_tests if r["success"])
        
        print(f"  • Company URL Validation: {company_url_passed}/{len(company_url_tests)} ✅")
        print(f"  • API Endpoint Access: {api_passed}/{len(api_tests)} ✅")
        print(f"  • Schema Validation: {schema_passed}/{len(schema_tests)} ✅")
        
        print("\n✅ WHAT'S WORKING:")
        for result in self.test_results:
            if result["success"]:
                print(f"  • {result['test']}: {result['message']}")
        
        if failed_tests > 0:
            print("\n❌ WHAT NEEDS ATTENTION:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n🎉 CONCLUSION:")
        if failed_tests == 0:
            print("  All validation fixes are working correctly!")
            print("  Company URL validation accepts empty strings and valid URLs")
            print("  API endpoints are accessible and return expected responses")
            print("  Z.union schema approach is functioning properly")
        else:
            print(f"  {failed_tests} issue(s) found that need attention")
            print("  Review failed tests above for specific problems")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = OfferlessValidationTester()
    report = tester.run_focused_tests()
    
    # Exit with error code if tests failed
    if report["failed_tests"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)