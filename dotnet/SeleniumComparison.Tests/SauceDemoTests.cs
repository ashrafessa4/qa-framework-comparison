using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SeleniumComparison.Tests.Pages;

namespace SeleniumComparison.Tests;

[TestFixture]
[Parallelizable(ParallelScope.None)]
public sealed class SauceDemoTests
{
    private IWebDriver _driver = null!;
    private SauceDemoPage _app = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new ChromeOptions();
        options.AddArguments(
            "--headless=new",
            "--window-size=1440,900",
            "--no-sandbox",
            "--disable-dev-shm-usage");
        _driver = new ChromeDriver(options);
        _driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(20);
        var wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(10));
        var baseUrl = Environment.GetEnvironmentVariable("BASE_URL")
            ?? "https://www.saucedemo.com";
        _app = new SauceDemoPage(_driver, wait, baseUrl);
        _app.Open();
    }

    [TearDown]
    public void TearDown()
    {
        try
        {
            if (TestContext.CurrentContext.Result.Outcome.Status == NUnit.Framework.Interfaces.TestStatus.Failed)
            {
                var evidenceDirectory = Path.Combine(
                    TestContext.CurrentContext.WorkDirectory, "test-results");
                Directory.CreateDirectory(evidenceDirectory);
                var safeName = string.Concat(
                    TestContext.CurrentContext.Test.Name.Select(character =>
                        Path.GetInvalidFileNameChars().Contains(character) ? '_' : character));
                var screenshot = ((ITakesScreenshot)_driver).GetScreenshot();
                screenshot.SaveAsFile(Path.Combine(evidenceDirectory, $"{safeName}.png"));
            }
        }
        finally
        {
            _driver.Quit();
            _driver.Dispose();
        }
    }

    [Test]
    public void Scenario1_ValidUserSignsIn()
    {
        _app.Login(TestData.StandardUsername, TestData.Password);

        Assert.That(_app.Visible(By.CssSelector("[data-test='title']")).Text, Is.EqualTo("Products"));
    }

    [Test]
    public void Scenario2_LockedUserSeesAnError()
    {
        _app.Login(TestData.LockedUsername, TestData.Password);

        Assert.That(
            _app.Visible(By.CssSelector("[data-test='error']")).Text,
            Does.Contain("locked out"));
    }

    [Test]
    public void Scenario3_ProductCanBeAddedToTheCart()
    {
        _app.Login(TestData.StandardUsername, TestData.Password);
        _app.AddBackpack();
        _app.Visible(By.CssSelector("[data-test='shopping-cart-link']")).Click();

        Assert.That(
            _app.Visible(By.CssSelector("[data-test='inventory-item']")).Text,
            Does.Contain(TestData.Product));
    }

    [Test]
    public void Scenario4_ProductsSortByAscendingPrice()
    {
        _app.Login(TestData.StandardUsername, TestData.Password);
        new SelectElement(_app.Visible(By.CssSelector("[data-test='product-sort-container']")))
            .SelectByValue("lohi");
        var prices = _app.Prices();

        Assert.That(prices, Is.EqualTo(prices.OrderBy(price => price)));
    }

    [Test]
    public void Scenario5_CustomerCompletesCheckout()
    {
        _app.Login(TestData.StandardUsername, TestData.Password);
        _app.CompleteCheckout();

        Assert.That(
            _app.Visible(By.CssSelector("[data-test='complete-header']")).Text,
            Is.EqualTo("Thank you for your order!"));
    }
}
