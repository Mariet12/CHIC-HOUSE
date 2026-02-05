using Electro.Core.Dtos.Checkout;
using Electro.Core.Models;

namespace Electro.Core.Dtos.AdminDashboard
{
    public sealed class DateRangeDto
    {
        public DateTime? From { get; set; }  // UTC
        public DateTime? To { get; set; }    // UTC
    }

    public sealed class SummaryCardDto
    {
        public decimal PaidAmount { get; set; }
        public decimal CompletedSales { get; set; }
        public int OrdersCount { get; set; }
        public int CustomersCount { get; set; }
        /// <summary>إجمالي المبيعات (كل الطلبات) للعرض في البطاقات</summary>
        [System.Text.Json.Serialization.JsonPropertyName("totalSales")]
        public decimal TotalSales { get; set; }
        /// <summary>إجمالي الطلبات للعرض في البطاقات</summary>
        [System.Text.Json.Serialization.JsonPropertyName("totalOrders")]
        public int TotalOrders { get; set; }
        /// <summary>إجمالي العملاء للعرض في البطاقات</summary>
        [System.Text.Json.Serialization.JsonPropertyName("totalCustomers")]
        public int TotalCustomers { get; set; }
        /// <summary>إجمالي المنتجات للعرض في البطاقات</summary>
        [System.Text.Json.Serialization.JsonPropertyName("totalProducts")]
        public int TotalProducts { get; set; }
    }

    public class RecentOrderRowDto
    {
        [System.Text.Json.Serialization.JsonPropertyName("orderId")]
        public int OrderId { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("orderNumber")]
        public string OrderNumber { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("customer")]
        public string Customer { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("email")]
        public string Email { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("phoneNumber")]
        public string PhoneNumber { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("paymentMethod")]
        public string PaymentMethod { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("shippingAddress")]
        public string ShippingAddress { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string UserId { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("total")]
        public decimal Total { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("status")]
        public string Status { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("paymentStatus")]
        public bool PaymentStatus { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("orderItems")]
        public ICollection<OrderItem> OrderItems { get; set; }
    }

    public sealed class SalesPointDto
    {
        public DateTime Date { get; set; }   // بداية اليوم (UTC)
        public decimal Amount { get; set; }  // مجموع المبيعات في اليوم (Completed)
    }

    public sealed class StatusBreakdownDto
    {
        public int Pending { get; set; }
        public int InProcessing { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
    }

    public sealed class TopProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
        public string? ImageUrl { get; set; }
    }

    public sealed class CategorySummaryRowDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int ProductsCount { get; set; }
    }

    public sealed class PaymentsStatsDto
    {
        public decimal PaidAmount { get; set; }
        public decimal UnpaidAmount { get; set; }
        public int PaidOrders { get; set; }
        public int UnpaidOrders { get; set; }
    }

    public sealed class PagedResult<T>
    {
        [System.Text.Json.Serialization.JsonPropertyName("pageNumber")]
        public int PageNumber { get; init; }
        [System.Text.Json.Serialization.JsonPropertyName("pageSize")]
        public int PageSize { get; init; }
        [System.Text.Json.Serialization.JsonPropertyName("totalCount")]
        public int TotalCount { get; init; }
        [System.Text.Json.Serialization.JsonPropertyName("totalPages")]
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        [System.Text.Json.Serialization.JsonPropertyName("items")]
        public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    }
    public class AdminCustomerRowDto
    {
        public string UserId { get; set; } = default!;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }

        // إحصائيات
        public int OrdersCount { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime? LastOrderAt { get; set; }
        public bool IsActive { get; set; }   // مثال: نشط/غير نشط حسب نظامك
    }

    public class AdminCustomerDetailsDto : AdminCustomerRowDto
    {
        public string? Address { get; set; }   // لو عندك حقول إضافية
        public string? City { get; set; }
        public string? Country { get; set; }
        public List<OrderDto> Orders { get; set; } = new();

    }
}
