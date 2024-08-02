import React from "react";
import "../Style/Sample.css"


const Sample=()=>{
    return(
        <>
        <div class="container">
        <div class="header">
            <h1>SR Challan</h1>
            <p>SR Water</p>
            <p>Address Line 1, Address Line 2</p>
            <p>Phone: (123) 456-7890 | Email: info@company.com</p>
        </div>
        <div class="content">
            <div>
                <h3>Bill To:</h3>
                <p>Customer Name</p>
                <p>Customer Address Line 1</p>
                <p>Customer Address Line 2</p>
                <p>Customer Phone: (123) 456-7890</p>
            </div>
            <div>
                <h3>Challan Details:</h3>
                <p>Challan No: 001</p>
                <p>Date: 2024-08-02</p>
            </div>
        </div>
        <table class="items">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Item 1 Description</td>
                    <td>2</td>
                    <td>$10.00</td>
                    <td>$20.00</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Item 2 Description</td>
                    <td>1</td>
                    <td>$15.00</td>
                    <td>$15.00</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Item 3 Description</td>
                    <td>3</td>
                    <td>$7.00</td>
                    <td>$21.00</td>
                </tr>
            </tbody>
        </table>
        <div class="total">
            <h3>Grand Total: $56.00</h3>
        </div>
        <div class="footer">
            <p>Thank you for your business!</p>
        </div>
    </div>
        </>
    )
}


export default Sample;