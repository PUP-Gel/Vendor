const express = require('express');
const cors = require('cors');
const path = require('path');

// for express
const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());


app.use(express.static('.'));

// Temporary data storage since di nag sql
let vendorDatabase = {
    vendors: [
        {
            id: 1,
            name: "Golden Bites Street Food",
            permitNumber: "HP-2024-00101",
            category: "food-beverage",
            sanitation: "good",
            cleanliness: ["daily-cleaning", "waste-disposal"]
        },
        {
            id: 2,
            name: "Fresh Harvest Fruits",
            permitNumber: "HP-2024-00102",
            category: "food-beverage",
            sanitation: "good",
            cleanliness: ["daily-cleaning"]
        }
    ]
};

//Kunin ang lahat ng vendors at dashboard chuchu
app.get('/vendors', (req, res) => {
  
    const total = vendorDatabase.vendors.length;

    
    const compliant = vendorDatabase.vendors.filter(v => v.sanitation === 'good').length;

    
    const improvement = vendorDatabase.vendors.filter(v => v.sanitation === 'fair').length;

   
    const nonCompliant = vendorDatabase.vendors.filter(v => v.sanitation === 'poor').length;

    // vendors per categ
    const categories = {
        school: vendorDatabase.vendors.filter(v => v.category === 'school-supply').length,
        office: vendorDatabase.vendors.filter(v => v.category === 'office-supplies').length,
        food: vendorDatabase.vendors.filter(v => v.category === 'food-beverage').length,
        clothing: vendorDatabase.vendors.filter(v => v.category === 'clothing-apparel').length,
        electronics: vendorDatabase.vendors.filter(v => v.category === 'electronics').length
    };

    // Ipadala ang response sa frontend
    res.json({
        total,
        compliant,
        improvement,
        nonCompliant,
        categories
    });
});


app.post('/register-vendor', (req, res) => {
    // Kunin ang data mula sa request body
    const { businessName, permitNumber, category, sanitation, cleanliness } = req.body;

    console.log('Received registration:', { businessName, permitNumber, category, sanitation, cleanliness });

    // I-validate kung may required fields
    if (!businessName || !permitNumber || !category || !sanitation) {
        return res.status(400).json({ error: 'Lahat ng fields ay required' });
    }

    // new vendor objects
    const newVendor = {
        id: vendorDatabase.vendors.length + 1,
        name: businessName,
        permitNumber: permitNumber,
        category: category,
        sanitation: sanitation,
        cleanliness: cleanliness || []
    };

    // Idagdag sa database
    vendorDatabase.vendors.push(newVendor);

    console.log('Vendor added:', newVendor);
    console.log('Total vendors now:', vendorDatabase.vendors.length);

    // Ipadala ang success response
    res.status(201).json({
        message: 'Vendor successfully registered',
        vendor: newVendor
    });
});


app.get('/vendor-list', (req, res) => {
   
    const { search = '', status = '', product = '' } = req.query;

    let filtered = vendorDatabase.vendors;

    // Filter by search query
    if (search) {
        filtered = filtered.filter(v =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.permitNumber.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Filter by compliance status
    if (status) {
        if (status === 'compliant') {
            filtered = filtered.filter(v => v.sanitation === 'good');
        } else if (status === 'need-improvement') {
            filtered = filtered.filter(v => v.sanitation === 'fair');
        } else if (status === 'non-compliant') {
            filtered = filtered.filter(v => v.sanitation === 'poor');
        }
    }

    // Filter by product category
    if (product) {
        filtered = filtered.filter(v => v.category === product);
    }

    // Ipadala ang filtered list
    res.json({
        vendors: filtered,
        total: filtered.length
    });
});


app.get('/vendor/:id', (req, res) => {
    const vendor = vendorDatabase.vendors.find(v => v.id === parseInt(req.params.id));

    if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);
});


app.put('/vendor/:id', (req, res) => {
    const vendor = vendorDatabase.vendors.find(v => v.id === parseInt(req.params.id));

    if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
    }

    // I-update ang vendor data kung may bagong values
    vendor.name = req.body.businessName || vendor.name;
    vendor.permitNumber = req.body.permitNumber || vendor.permitNumber;
    vendor.category = req.body.category || vendor.category;
    vendor.sanitation = req.body.sanitation || vendor.sanitation;
    vendor.cleanliness = req.body.cleanliness || vendor.cleanliness;

    res.json({
        message: 'Vendor updated successfully',
        vendor
    });
});


app.delete('/vendor/:id', (req, res) => {
    const index = vendorDatabase.vendors.findIndex(v => v.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ error: 'Vendor not found' });
    }

    const deletedVendor = vendorDatabase.vendors.splice(index, 1);

    res.json({
        message: 'Vendor deleted successfully',
        vendor: deletedVendor[0]
    });
});

// Simulan ang server
app.listen(PORT, () => {
    console.log(`Server ay tumatakbo sa http://localhost:${PORT}`);
    console.log(`Pumunta sa http://localhost:${PORT}/index.html`);
});
