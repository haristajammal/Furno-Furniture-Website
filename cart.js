
    // Format number as PKR currency string with commas
    function formatPKR(num) {
        return 'PKR ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Calculate and update totals
    function updateCartTotals() {
        let subtotal = 0;
        const productRows = document.querySelectorAll('table tr');

        productRows.forEach(row => {
            const quantityInput = row.querySelector('input.quantity');
            const subtotalCell = row.querySelector('.product-subtotal');
            if (quantityInput && subtotalCell) {
                const price = parseFloat(subtotalCell.dataset.price);
                const quantity = parseInt(quantityInput.value);
                const productSubtotal = price * quantity;
                subtotalCell.textContent = formatPKR(productSubtotal);
                subtotal += productSubtotal;
            }
        });

        const tax = subtotal * 0.10; // 10% tax
        const total = subtotal + tax;

        document.getElementById('subtotal-value').textContent = formatPKR(subtotal);
        document.getElementById('tax-value').textContent = formatPKR(tax);
        document.getElementById('total-value').textContent = formatPKR(total);
    }

    // Remove product row
    function removeProductRow(link) {
        link.closest('tr').remove();
        updateCartTotals();
    }

    // Event listeners for quantity change and remove links
    document.querySelectorAll('input.quantity').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            updateCartTotals();
        });
    });

    document.querySelectorAll('a.remove-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to remove this item?')) {
                removeProductRow(this);
            }
        });
    });

    // Initialize totals on page load
    window.addEventListener('load', () => {
        updateCartTotals();
    });

    // Generate Invoice PDF
    document.getElementById('generate-invoice').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Furno Furniture Store", 14, 22);
        doc.setFontSize(12);
        doc.text("Invoice", 14, 32);

        let y = 40;
        doc.setFontSize(10);
        doc.text("Product", 14, y);
        doc.text("Quantity", 90, y);
        doc.text("Price", 130, y);
        doc.text("Subtotal", 170, y);
        y += 6;

        const productRows = document.querySelectorAll('table tr');
        productRows.forEach(row => {
            const productName = row.querySelector('.cart-info p')?.textContent;
            const quantityInput = row.querySelector('input.quantity');
            const priceCell = row.querySelector('.cart-info small');
            const subtotalCell = row.querySelector('.product-subtotal');

            if (productName && quantityInput && priceCell && subtotalCell) {
                doc.text(productName, 14, y);
                doc.text(quantityInput.value, 95, y);
                doc.text(priceCell.textContent, 130, y);
                doc.text(subtotalCell.textContent, 170, y);
                y += 6;
            }
        });

        y += 10;
        doc.text(`Subtotal: ${document.getElementById('subtotal-value').textContent}`, 14, y);
        y += 6;
        doc.text(`Tax (10%): ${document.getElementById('tax-value').textContent}`, 14, y);
        y += 6;
        doc.text(`Total: ${document.getElementById('total-value').textContent}`, 14, y);

        doc.save('invoice.pdf');
    });
