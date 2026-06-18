# 📊 AI Data Lens – Autonomous Data Analysis Agent

## Overview

AI Data Lens is an autonomous data analysis platform that enables users to upload datasets, ask business questions in natural language, and receive actionable insights through automated analysis and visualizations.

The platform eliminates the need for users to write SQL queries or Python scripts by leveraging AI-powered data understanding, analytical reasoning, and visualization generation.

Built as part of **Assignment 9: Autonomous Data Analysis Agent**, the system transforms raw data into understandable business insights through a conversational interface.

---

## Problem Statement

Business users often rely on data analysts and data scientists to answer routine analytical questions. This creates bottlenecks and slows decision-making.

AI Data Lens addresses this challenge by allowing users to:

* Upload datasets directly
* Ask questions in plain English
* Receive automated analysis
* View generated visualizations
* Understand findings through clear narratives

---

## Features

### Data Ingestion

Supports multiple data formats:

* CSV
* Excel (.xlsx)
* JSON

Dataset profiling includes:

* Schema detection
* Data type identification
* Missing value analysis
* Dataset statistics
* Structural validation

---

### Natural Language Analysis

Users can ask business questions such as:

* "Which region generated the highest revenue?"
* "What are the sales trends over time?"
* "Which variables are most strongly correlated?"

The system interprets user intent and translates it into analytical operations.

---

### Automated Insight Generation

The platform automatically performs:

* Aggregation
* Filtering
* Grouping
* Trend analysis
* Correlation analysis
* Comparative analysis

Generated insights are presented in an understandable business-friendly format.

---

### Visualization Generation

The system dynamically creates appropriate charts, including:

* Bar Charts
* Line Charts
* Scatter Plots
* Distribution Charts
* Heatmaps

Each visualization includes:

* Meaningful titles
* Proper labels
* Contextual explanations

---

### Conversational Analytics

Users can continue asking follow-up questions based on previous analyses.

Examples:

* "Show this trend by region."
* "Compare the top 5 categories."
* "Explain the anomaly in March."

This enables an iterative exploration workflow similar to interacting with a human analyst.

---

## System Architecture

### Frontend

Responsible for:

* File uploads
* User interaction
* Analysis visualization
* Conversational interface

### AI Layer

Responsible for:

* Understanding user queries
* Dataset interpretation
* Insight generation
* Analytical reasoning

### Visualization Engine

Responsible for:

* Chart selection
* Data transformation
* Visualization rendering

---

## Project Workflow

1. User uploads dataset
2. Dataset is validated and profiled
3. User submits a business question
4. AI interprets the request
5. Relevant analysis is generated
6. Results are processed
7. Appropriate visualization is created
8. Insights are presented in natural language
9. User may continue with follow-up questions

---

## Installation

### Prerequisites

* Node.js 18+
* npm or yarn

### Setup

Clone the repository:

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd ai-data-lens
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Example Workflow

1. Upload a sales dataset.
2. Ask:

```text
Which product category generated the highest revenue?
```

3. Receive:

* Analytical results
* Visualization
* Explanation of findings
* Suggested follow-up questions

---

## Success Criteria

The project aims to:

* Correctly answer diverse business questions
* Generate meaningful visualizations
* Present understandable insights
* Support iterative exploration
* Reduce dependency on manual SQL and scripting

---

## Deliverables

* Source Code
* README Documentation
* Architecture Overview
* Conversational Data Analysis Interface
* Automated Visualization Engine

---

## Future Improvements

Potential enhancements include:

* SQL database connections
* Advanced anomaly detection
* Predictive analytics
* Dashboard export functionality
* Multi-user analysis sessions
* Enhanced data quality scoring

---

## Team

Developed as part of the GenAI project assignment.
Group Number: 9
Group Size: 5 Students
Team Members: Prabal Patra, Vanshika Vishal, Shubh Srivastava, Sanigaram Sachith Reddy, Sakshi
Batch : A (2028)
