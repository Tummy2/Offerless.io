#!/usr/bin/env python3
"""
Direct Validation Test - Tests validation logic by examining the actual validation schema
"""

import requests
import json
import sys
from datetime import datetime

class DirectValidationTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: dict = None):
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

    def test_malformed_json_handling(self):
        """Test that malformed JSON is handled before validation"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/applications",
                data="invalid json",
                headers={"Content-Type": "application/json"}
            )
            
            # Should return 400 for malformed JSON or 401 for auth
            if response.status_code in [400, 401]:
                self.log_test("Malformed JSON Handling", True, f"Malformed JSON properly handled (status: {response.status_code})")
                return True
            else:
                self.log_test("Malformed JSON Handling", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Malformed JSON Handling", False, f"Request failed: {str(e)}")
            return False

    def test_company_url_validation_comprehensive(self):
        """Test comprehensive company_url validation scenarios"""
        test_cases = [
            {
                "company_url": "",
                "description": "empty string",
                "should_pass": True
            },
            {
                "company_url": "https://example.com",
                "description": "valid HTTPS URL",
                "should_pass": True
            },
            {
                "company_url": "http://example.com",
                "description": "valid HTTP URL", 
                "should_pass": True
            },
            {
                "company_url": "https://subdomain.example.com/path?query=1",
                "description": "complex valid HTTPS URL",
                "should_pass": True
            },
            {
                "company_url": "not-a-url",
                "description": "invalid URL format",
                "should_pass": False
            },
            {
                "company_url": "ftp://example.com",
                "description": "FTP URL (should be rejected)",
                "should_pass": False
            },
            {
                "company_url": "example.com",
                "description": "URL without protocol",
                "should_pass": False
            }
        ]
        
        all_passed = True
        
        for i, test_case in enumerate(test_cases):
            try:
                test_application = {
                    "company": "Test Company",
                    "job_title": "Software Engineer",
                    "applied_at": "2024-01-15",
                    "status": "applied",
                    "location_kind": "remote",
                    "company_url": test_case["company_url"]
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/applications",
                    json=test_application,
                    headers={"Content-Type": "application/json"}
                )
                
                if test_case["should_pass"]:
                    # Should reach auth check (401) if validation passes
                    if response.status_code == 401:
                        self.log_test(f"Company URL - {test_case['description']}", True, "Validation passed (reached auth check)")
                    else:
                        self.log_test(f"Company URL - {test_case['description']}", False, f"Expected 401 but got {response.status_code}")
                        all_passed = False
                else:
                    # Should fail validation (400) before reaching auth check
                    if response.status_code == 400:
                        try:
                            data = response.json()
                            if "validation" in data.get("error", "").lower():
                                self.log_test(f"Company URL - {test_case['description']}", True, "Validation properly rejected invalid URL")
                            else:
                                self.log_test(f"Company URL - {test_case['description']}", False, "400 error but not validation-related", {"response": data})
                                all_passed = False
                        except:
                            self.log_test(f"Company URL - {test_case['description']}", False, "400 error with invalid JSON response")
                            all_passed = False
                    elif response.status_code == 401:
                        self.log_test(f"Company URL - {test_case['description']}", False, "Invalid URL was accepted (should be rejected by validation)")
                        all_passed = False
                    else:
                        self.log_test(f"Company URL - {test_case['description']}", False, f"Unexpected status code: {response.status_code}")
                        all_passed = False
                        
            except Exception as e:
                self.log_test(f"Company URL - {test_case['description']}", False, f"Request failed: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_missing_company_url_field(self):
        """Test that missing company_url field is handled correctly"""
        try:
            test_application = {
                "company": "Test Company",
                "job_title": "Software Engineer",
                "applied_at": "2024-01-15",
                "status": "applied",
                "location_kind": "remote"
                # No company_url field
            }
            
            response = self.session.post(
                f"{self.base_url}/api/applications",
                json=test_application,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("Missing Company URL Field", True, "Missing company_url field handled correctly (reached auth check)")
                return True
            elif response.status_code == 400:
                try:
                    data = response.json()
                    self.log_test("Missing Company URL Field", False, "Missing company_url field caused validation error", {"response": data})
                    return False
                except:
                    self.log_test("Missing Company URL Field", False, "400 error with invalid JSON response")
                    return False
            else:
                self.log_test("Missing Company URL Field", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Missing Company URL Field", False, f"Request failed: {str(e)}")
            return False

    def test_api_endpoint_structure(self):
        """Test that API endpoints are properly structured"""
        endpoints = [
            "/api/applications",
            "/api/leaderboard",
            "/api/me/stats"
        ]
        
        all_accessible = True
        
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                
                if response.status_code == 401:
                    continue  # Expected for protected endpoints
                elif response.status_code in [200, 405]:
                    continue  # Also acceptable
                else:
                    self.log_test(f"API Endpoint {endpoint}", False, f"Unexpected status code: {response.status_code}")
                    all_accessible = False
                    
            except Exception as e:
                self.log_test(f"API Endpoint {endpoint}", False, f"Request failed: {str(e)}")
                all_accessible = False
        
        if all_accessible:
            self.log_test("API Endpoint Structure", True, "All API endpoints are accessible")
            return True
        
        return False

    def run_direct_tests(self):
        """Run direct validation tests"""
        print("🔬 Starting Direct Validation Tests")
        print("=" * 40)
        print("Testing validation logic and API structure")
        print()
        
        # Test malformed JSON handling
        print("🧪 Testing Request Handling:")
        print("-" * 28)
        self.test_malformed_json_handling()
        
        print()
        print("🔍 Testing Company URL Validation:")
        print("-" * 35)
        company_url_passed = self.test_company_url_validation_comprehensive()
        
        print()
        print("📝 Testing Optional Fields:")
        print("-" * 26)
        self.test_missing_company_url_field()
        
        print()
        print("🌐 Testing API Structure:")
        print("-" * 24)
        self.test_api_endpoint_structure()
        
        return self.generate_direct_report()

    def generate_direct_report(self):
        """Generate direct test report"""
        print("\n" + "=" * 40)
        print("📊 DIRECT VALIDATION TEST RESULTS")
        print("=" * 40)
        
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
        
        print("\n✅ SUCCESSFUL TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  ✅ {result['test']}: {result['message']}")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = DirectValidationTester()
    report = tester.run_direct_tests()
    
    # Exit with error code if tests failed
    if report["failed_tests"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)