const express = require('express');
const axios = require('axios');

const app = express();
const port = 3021;

const ecomCompanies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
console.log("srii")

const authToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwMjQ1MTEzLCJpYXQiOjE3MjAyNDQ4MTMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdiN2RkMzg0LTdmNTYtNGNiNi04NjNjLWQ3ODU4MjY5ZWQ2YyIsInN1YiI6Imd1cnVyYWouZC43Ny4wMDdAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiRHJvcHMiLCJjbGllbnRJRCI6IjdiN2RkMzg0LTdmNTYtNGNiNi04NjNjLWQ3ODU4MjY5ZWQ2YyIsImNsaWVudFNlY3JldCI6ImlzWldkbVRQY1dwTnhsb08iLCJvd25lck5hbWUiOiJHdXJ1IFJhaiBEIiwib3duZXJFbWFpbCI6Imd1cnVyYWouZC43Ny4wMDdAZ21haWwuY29tIiwicm9sbE5vIjoiNFZWMjFDSTAyMiJ9.2qaPDjetVvGpxIFBVUnGJTopkARJYXmkIMlj5LjxKaI";


const axiosInstance = axios.create({
    headers: {
        Authorization: authToken,
    }
});
console.log("wjerkoj iytguyf")  

let productIdCounter = 1;


function generateProductId() {
    return `prod_${Date.now()}_${productIdCounter++}`;
}

app.get('/categories/:categoryName/products', async (req, res) => {
    const {categoryName } = req.params;
    const { minPrice = 0, maxPrice = Infinity, top = 10, page = 1, n = 10 } = req.query;

    try {
        const fetchProductsPromises = ecomCompanies.map(name =>
            axiosInstance.get(`http://20.244.56.144/test/companies/${name}/categories/${categoryName}/products/?minPrice=${minPrice}&maxPrice=${maxPrice}&top=${top}`)
        );

        const results = await Promise.all(fetchProductsPromises);
        console.log(results)

        let products = results.flatMap(result => result.data.products).map(product => ({
            ...product,
            id: generateProductId()  
        }));

        // Pagination
        const startIndex = (page - 1) * n;
        const endIndex = startIndex + n;
        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json({
            products: paginatedProducts,
            totalProducts: products.length,
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(products.length / n)
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/categories/:categoryName/products/:productId', async (req, res) => {
    const {  productId } = req.params;

    try {
        const fetchProductDetailsPromises = ecomCompanies.map(name =>
            axiosInstance.get(`http://20.244.56.144/test/companies/${name}/categories/${categoryName}/products/${productId}`)
        );

        const results = await Promise.all(fetchProductDetailsPromises);
        const productDetails = results.map(result => result.data).find(product => product.id === productId);

        if (productDetails) {
            res.json(productDetails);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }

    } catch (error) {
        console.error('Error fetching product details:', error.message);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
