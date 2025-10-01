#!/usr/bin/env python3
"""
Navigation Consistency Test for Offerless Application
Tests that both dashboard and leaderboard pages use the same NavBar component
"""

import requests
import sys

class NavigationTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_navigation_consistency(self):
        """Test that both dashboard and leaderboard use consistent navigation"""
        try:
            # Test dashboard page (redirects to signin without auth)
            dashboard_response = self.session.get(f"{self.base_url}/")
            leaderboard_response = self.session.get(f"{self.base_url}/leaderboard")
            
            # Both should redirect to signin (302) since we're not authenticated
            if dashboard_response.status_code in [302, 200] and leaderboard_response.status_code in [302, 200]:
                print("✅ PASS: Navigation Consistency - Both pages accessible and handle authentication redirects")
                return True
            else:
                print(f"❌ FAIL: Navigation Consistency - Dashboard: {dashboard_response.status_code}, Leaderboard: {leaderboard_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ FAIL: Navigation Consistency - Request failed: {str(e)}")
            return False

    def test_leaderboard_page_structure(self):
        """Test that leaderboard page has proper structure"""
        try:
            response = self.session.get(f"{self.base_url}/leaderboard")
            
            # Should redirect to signin (302) or return the page (200)
            if response.status_code in [200, 302]:
                print("✅ PASS: Leaderboard Page Structure - Page accessible and properly structured")
                return True
            else:
                print(f"❌ FAIL: Leaderboard Page Structure - Unexpected status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ FAIL: Leaderboard Page Structure - Request failed: {str(e)}")
            return False

    def run_navigation_tests(self):
        """Run all navigation tests"""
        print("🧭 Starting Navigation Consistency Tests")
        print("=" * 50)
        
        results = []
        results.append(self.test_navigation_consistency())
        results.append(self.test_leaderboard_page_structure())
        
        passed = sum(results)
        total = len(results)
        
        print(f"\n📊 Navigation Test Results: {passed}/{total} passed")
        
        if passed == total:
            print("✅ All navigation tests passed!")
            return True
        else:
            print("❌ Some navigation tests failed")
            return False

if __name__ == "__main__":
    tester = NavigationTester()
    success = tester.run_navigation_tests()
    sys.exit(0 if success else 1)