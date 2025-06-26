# CSV Upload Example

This file provides an example of the CSV format expected for bulk product uploads in Valle Sagrado.

## CSV Format

The CSV file should include the following columns. Required columns are marked with *(required)*.

### Sample CSV Content

```csv
Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Grams,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Variant Weight Unit,Cost per item
artisan-coffee-mug,Artisan Coffee Mug,"<p>Beautiful handcrafted ceramic coffee mug made by local artisans in the Sacred Valley. Perfect for your morning coffee or tea.</p>",Valle Sagrado Artisans,Kitchenware,"ceramic,handmade,coffee,mug,artisan",TRUE,Title,Default Title,COFFEE-MUG-001,300,25,deny,manual,24.99,29.99,TRUE,TRUE,7891234567890,https://example.com/images/coffee-mug.jpg,g,12.50
woven-alpaca-scarf,Woven Alpaca Scarf,"<p>Luxurious soft alpaca wool scarf woven by indigenous artisans. Available in natural earth tones.</p>",Valle Sagrado Textiles,Clothing,"alpaca,wool,scarf,handwoven,textile",TRUE,Color,Natural Brown,SCARF-ALP-001,150,15,deny,manual,89.99,109.99,TRUE,TRUE,7891234567891,https://example.com/images/alpaca-scarf.jpg,g,45.00
ceramic-vase-large,Large Ceramic Vase,"<p>Traditional ceramic vase with intricate Incan-inspired patterns. Perfect for home decoration.</p>",Valle Sagrado Ceramics,Home Decor,"ceramic,vase,decoration,traditional,handmade",TRUE,Size,Large,VASE-CER-L001,800,8,deny,manual,149.99,179.99,TRUE,TRUE,7891234567892,https://example.com/images/ceramic-vase-large.jpg,g,75.00
quinoa-flour-organic,Organic Quinoa Flour,"<p>Premium organic quinoa flour sourced directly from high-altitude farms in the Sacred Valley.</p>",Valle Sagrado Foods,Food & Beverages,"quinoa,flour,organic,gluten-free,superfood",TRUE,Weight,1kg,QUINOA-FLOUR-1KG,1000,50,deny,manual,12.99,15.99,TRUE,TRUE,7891234567893,https://example.com/images/quinoa-flour.jpg,g,6.50
silver-jewelry-set,Silver Jewelry Set,"<p>Elegant silver jewelry set featuring traditional Andean designs. Includes necklace and earrings.</p>",Valle Sagrado Jewelry,Jewelry,"silver,jewelry,handcrafted,traditional,set",TRUE,Style,Traditional,JEWELRY-AG-SET001,50,5,deny,manual,299.99,349.99,TRUE,TRUE,7891234567894,https://example.com/images/silver-jewelry-set.jpg,g,150.00
```

## Column Descriptions

### Required Columns

- **Handle**: Unique product identifier/slug (will be used for URL)
- **Title**: Product name/title
- **Vendor**: Brand or vendor name
- **Published**: TRUE/FALSE - whether product should be active
- **Option1 Name**: Name of the first product option (use "Title" if no variants)
- **Option1 Value**: Value of the first option (use "Default Title" if no variants)
- **Variant SKU**: Unique stock keeping unit
- **Variant Grams**: Product weight in grams
- **Variant Inventory Qty**: Stock quantity
- **Variant Inventory Policy**: "deny" or "continue" for out-of-stock handling
- **Variant Fulfillment Service**: "manual" for manual fulfillment
- **Variant Price**: Selling price (without currency symbols)
- **Variant Requires Shipping**: TRUE/FALSE
- **Variant Taxable**: TRUE/FALSE
- **Variant Weight Unit**: Weight unit (g, kg, lb, oz)

### Optional Columns

- **Body (HTML)**: Product description (HTML allowed)
- **Type**: Product category/type
- **Tags**: Comma-separated tags
- **Variant Compare At Price**: Original price for sale comparison
- **Variant Barcode**: Product barcode/UPC
- **Image Src**: Primary product image URL
- **Cost per item**: Cost price for profit calculations

## Important Notes

1. **Currency**: All prices should be in the project's default currency (typically USD)
2. **Images**: Provide full URLs to product images
3. **Weight**: Always specify weight in grams for shipping calculations
4. **Stock**: Inventory quantity should be accurate for stock tracking
5. **SKU**: Each product must have a unique SKU identifier
6. **Tags**: Separate multiple tags with commas
7. **HTML**: Product descriptions can include basic HTML formatting

## File Requirements

- File format: CSV (Comma Separated Values)
- Encoding: UTF-8
- Maximum file size: 10MB
- Maximum rows: 1000 products per upload

## After Upload

Once uploaded, the system will:
1. Validate all required fields
2. Check for duplicate SKUs
3. Create products in your project
4. Generate URL slugs from handles
5. Set up inventory tracking
6. Process and validate image URLs

Products will be created in "draft" status if any validation issues are found, allowing you to review and fix them individually. 