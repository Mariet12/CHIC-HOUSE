using Electro.Core.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Electro.Core.Dtos.Product
{
    public class CreateProductDto
    {
        [Required]
        public string Name_Ar { get; set; }

        [Required]
        public string Name_En { get; set; }

        public string Description { get; set; }
        public string CountryOfOrigin { get; set; }
        public string Brand { get; set; }
        public string Warranty { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public double Price { get; set; }


        [Required]
        public int CategoryId { get; set; }

        public List<IFormFile> Images { get; set; } = new List<IFormFile>();
    }

    public class UpdateProductDto
    {
        public string Name_Ar { get; set; }
        public string Name_En { get; set; }
        public string Description { get; set; }
        public string CountryOfOrigin { get; set; }
        public string Brand { get; set; }
        public string? Warranty { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public double? Price { get; set; }

        [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
        public double? Discount { get; set; }

        public int? CategoryId { get; set; }
        public List<IFormFile> NewImages { get; set; } = new List<IFormFile>();
        public List<int> ImageIdsToDelete { get; set; } = new List<int>();
    }

    public class ProductDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("name_Ar")]
        public string Name_Ar { get; set; }
        [JsonPropertyName("name_En")]
        public string Name_En { get; set; }
        [JsonPropertyName("description")]
        public string Description { get; set; }
        [JsonPropertyName("countryOfOrigin")]
        public string CountryOfOrigin { get; set; }
        [JsonPropertyName("brand")]
        public string Brand { get; set; }
        [JsonPropertyName("warranty")]
        public string Warranty { get; set; }
        [JsonPropertyName("price")]
        public double Price { get; set; }
        [JsonPropertyName("categoryId")]
        public int CategoryId { get; set; }
        [JsonPropertyName("categoryName")]
        public string CategoryName { get; set; }
        [JsonPropertyName("images")]
        public List<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
        [JsonPropertyName("isFavorite")]
        public bool IsFavorite { get; set; }
        [JsonPropertyName("isInCart")]
        public bool IsInCart { get; set; }
        [JsonPropertyName("firstImageUrl")]
        public string? FirstImageUrl { get; set; }
        [JsonPropertyName("effectivePrice")]
        public decimal EffectivePrice { get; set; }
        [JsonPropertyName("hasDiscount")]
        public bool HasDiscount { get; set; }
        [JsonPropertyName("appliedBannerId")]
        public int? AppliedBannerId { get; set; }
        [JsonPropertyName("appliedBannerTitle")]
        public string? AppliedBannerTitle { get; set; }
        [JsonPropertyName("discountValue")]
        public decimal? DiscountValue { get; set; }
        [JsonPropertyName("discountType")]
        public DiscountType? DiscountType { get; set; }
        [JsonPropertyName("displayOrder")]
        public int DisplayOrder { get; set; }
    }

    public class ProductImageDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; }
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
    }

    /// <summary>عنصر واحد لتحديث ترتيب المنتج</summary>
    public class DisplayOrderItemDto
    {
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
        [JsonPropertyName("displayOrder")]
        public int DisplayOrder { get; set; }
    }

    public class UpdateDisplayOrderRequestDto
    {
        [JsonPropertyName("updates")]
        public List<DisplayOrderItemDto> Updates { get; set; } = new();
    }
}
