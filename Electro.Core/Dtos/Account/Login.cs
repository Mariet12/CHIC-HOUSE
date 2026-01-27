using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Electro.Core.Dtos.Account
{
    public class Login
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        public string? FcmToken { get; set; } // ✨ جديد
    }
    public class LoginAdmin
    {
        [EmailAddress]
        public string Email { get; set; }
        public string Password { get; set; }
        public string? FcmToken { get; set; } // ✨ جديد


    }
}
