using System.Globalization;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace SeleniumComparison.Tests.Pages;

internal sealed class SauceDemoPage(IWebDriver driver, WebDriverWait wait, string baseUrl)
{
    private readonly IWebDriver _driver = driver;
    private readonly WebDriverWait _wait = wait;
    private readonly string _baseUrl = baseUrl;

    internal void Open()
    {
        _driver.Navigate().GoToUrl(_baseUrl);
        Visible(By.CssSelector("[data-test='login-button']"));
    }

    internal void Login(string username, string password)
    {
        Visible(By.CssSelector("[data-test='username']")).SendKeys(username);
        Visible(By.CssSelector("[data-test='password']")).SendKeys(password);
        Clickable(By.CssSelector("[data-test='login-button']")).Click();
    }

    internal void AddBackpack()
    {
        var item = InventoryItems().Single(element => element.Text.Contains(TestData.Product));
        item.FindElement(By.TagName("button")).Click();
    }

    internal IReadOnlyList<decimal> Prices()
    {
        return _driver.FindElements(By.CssSelector("[data-test='inventory-item-price']"))
            .Select(element => decimal.Parse(element.Text.TrimStart('$'), CultureInfo.InvariantCulture))
            .ToList();
    }

    internal void CompleteCheckout()
    {
        AddBackpack();
        Clickable(By.CssSelector("[data-test='shopping-cart-link']")).Click();
        Clickable(By.CssSelector("[data-test='checkout']")).Click();
        Visible(By.CssSelector("[data-test='firstName']")).SendKeys(TestData.FirstName);
        Visible(By.CssSelector("[data-test='lastName']")).SendKeys(TestData.LastName);
        Visible(By.CssSelector("[data-test='postalCode']")).SendKeys(TestData.PostalCode);
        Clickable(By.CssSelector("[data-test='continue']")).Click();
        _wait.Until(currentDriver => currentDriver.Url.EndsWith("checkout-step-two.html"));
        Clickable(By.CssSelector("[data-test='finish']")).Click();
    }

    internal IWebElement Visible(By locator)
    {
        return _wait.Until(currentDriver =>
        {
            try
            {
                var element = currentDriver.FindElement(locator);
                return element.Displayed ? element : null;
            }
            catch (NoSuchElementException)
            {
                return null;
            }
            catch (StaleElementReferenceException)
            {
                return null;
            }
        })!;
    }

    internal IWebElement Clickable(By locator)
    {
        return _wait.Until(currentDriver =>
        {
            try
            {
                var element = currentDriver.FindElement(locator);
                return element.Displayed && element.Enabled ? element : null;
            }
            catch (NoSuchElementException)
            {
                return null;
            }
            catch (StaleElementReferenceException)
            {
                return null;
            }
        })!;
    }

    private IReadOnlyCollection<IWebElement> InventoryItems()
    {
        _wait.Until(currentDriver =>
            currentDriver.FindElements(By.CssSelector("[data-test='inventory-item']")).Count > 0);
        return _driver.FindElements(By.CssSelector("[data-test='inventory-item']"));
    }
}
