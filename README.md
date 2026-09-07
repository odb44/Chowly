Chowly

Chowly is a full-stack restaurant ordering and order-management web
application built for the Software Engineering assignment. It provides
customer and waiter workflows, persistent PostgreSQL storage, order
preparation tracking, simulated payment, complaint/rating support, and
public deployment.

Live Application

Frontend: https://chowly-frontend-28r4.onrender.com

Backend API: https://chowly-backend-ywdp.onrender.com/api

GitHub: https://github.com/odb44/Chowly

Features

Customer

Browse available food and drinks.

Add items to a cart and adjust quantities.

Select a restaurant table.

Place an order.

View order details, total amount and estimated waiting time.

Monitor a live waiting-time countdown.

Track order preparation status.

Make a clearly labelled pretend/simulated payment after the order is
served.

Submit a complaint for a delayed order.

Submit a rating and comment.

Waiter

Switch to the waiter role without login.

View incoming and active orders.

Inspect order details.

Assign chefs to food items.

Assign bartenders to drink items.

Update preparation status.

Mark orders as served.

Monitor the live waiting-time countdown.

Order Workflow

Menu → Cart → Table Selection → Order → Staff Assignment → Preparation
→ Served → Pretend Payment

Complaint and rating functionality is available for delayed/problematic
orders.

Technology Stack

Frontend - React - TypeScript - Vite - Custom CSS

Backend - Java 21 - Spring Boot - Spring Data JPA / Hibernate -
Maven - REST API

Database - PostgreSQL

Deployment - Docker - Render - GitHub

Project Structure

Chowly/
├── frontend/          # React + TypeScript application
├── backend/           # Spring Boot REST API
├── docs/              # Documentation and project assets
├── README.md
└── .gitignore

Final Data Model

The implemented model contains:

MENU_ITEM

TABLE

WAITER

CHEF

BARTENDER

ORDER

ORDER_ITEM

COMPLAINT

RATING

PAYMENT

ORDER_STATUS_HISTORY --- bonus status-history tracking

Waiting-Time Logic

When an order is created, the estimated waiting time is calculated from
the maximum preparation time of the ordered menu items.

The frontend displays a live countdown. When the estimated time reaches
zero, the countdown continues into negative time until the order is
served, making delays visible to both customer and waiter.

Payment

Payment is intentionally simulated for the assignment.

The customer opens a served order.

The customer selects the payment action.

Chowly records the payment.

The order is marked as PAID.

The interface clearly states that the payment is pretend and no real
money is charged.

Persistence

Application data is stored in PostgreSQL. Orders, menu data, tables,
staff assignments, complaints, ratings and payments remain available
after page refreshes.

API

The Spring Boot backend provides REST endpoints for the main workflows,
including menu items, tables, staff, orders, order items, complaints,
ratings, payments and order status history.

Production API: https://chowly-backend-ywdp.onrender.com/api

Local Development

Backend

Requirements: - Java 21 - PostgreSQL

Configure database credentials through environment variables. Do not
commit credentials to GitHub.

From the backend directory:

.\mvnw.cmd spring-boot:run

Frontend

The development environment uses Node.js through Docker.

From the project root:

docker run --rm -it -p 5173:5173 -v "${PWD}:/app" -w /app/frontend node:24-slim npm run dev -- --host 0.0.0.0

Local frontend:

http://localhost:5173

Production Build

docker run --rm -v "${PWD}:/app" -w /app/frontend node:24-slim npm run build

Deployment

Chowly is deployed on Render as separate services:

React frontend served through Nginx

Spring Boot backend

Render PostgreSQL database

Both frontend and backend are containerized with Docker.

Render free-tier services may cold-start after inactivity, so the first
request after a period of inactivity can take longer than normal.

Testing

Testing included:

Manual end-to-end browser workflows.

REST API checks.

Production API verification.

Browser developer-console/network inspection.

Frontend production builds after major changes.

Verified workflows included payment, status synchronization,
complaint/rating submission, chef assignment, bartender assignment and
live countdown behaviour.

AI-Assisted Development

ChatGPT was used as an engineering assistant for:

Backend entity, repository, service, controller and DTO structures.

Spring Boot, PostgreSQL and deployment troubleshooting.

CORS debugging.

Waiting-time countdown and timezone reasoning.

Menu expansion.

UI wording and documentation.

Architecture, data-model and workflow visual concepts.

AI suggestions were reviewed against the actual implementation, built
and manually tested. Incorrect or unsuitable outputs were corrected or
rejected.

Version Control

The project was developed incrementally using Git and maintained in a
public GitHub repository.

One verified development commit is:

3c9a0c7 — Expand Chowly menu

This commit expanded the seeded restaurant menu to the final 25-item
menu.

The full authoritative commit history is available in the repository.

Documentation

The accompanying documentation covers:

Project overview

Technology stack

System architecture

Final data model

Customer workflow

Waiter workflow

Waiting-time logic

Backend/API design

Frontend design

Testing and validation

Deployment

GitHub/version control

AI usage

Limitations and future improvements

Demonstration walkthrough

Requirements coverage

Evidence screenshots

Assignment Coverage

Chowly implements the required restaurant story from menu browsing and
order placement through preparation, serving and payment, with
complaint/rating functionality for delayed orders.

The application is publicly deployed and can be accessed through the
live link above.

Chowly --- Restaurant Ordering & Order Management
