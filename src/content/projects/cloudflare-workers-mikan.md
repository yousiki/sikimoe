---
title: 'Cloudflare Workers Mikan'
description: 'Mirror site of Mikan Project using Cloudflare Workers'
publishDate: 'Mar 19 2024'
seo:
  image:
    src: 'https://siki.moe/images/projects/cloudflare-workers-mikan/preview.png'
    alt: Mikan Project Logo
---

![Project preview](/images/projects/cloudflare-workers-mikan/preview.png)

## 🌟 Overview

Cloudflare Workers Mikan is a mirror site implementation of the Mikan Project using Cloudflare Workers, a serverless platform that allows running JavaScript code on Cloudflare's edge network. This project provides an alternative access point to the Mikan Project's content with improved performance and reliability through Cloudflare's global CDN.

## ✨ Features

- 🔄 **Full Mirror**: Complete mirror of the original Mikan Project site
- 🎯 **Custom Domain**: Support for custom domain configuration
- ⚡ **Serverless**: No server maintenance required, fully managed by Cloudflare

## 🏗️ Architecture

The project is built using modern web technologies:

- **Cloudflare Workers**: Serverless execution environment
- **Hono**: Fast, lightweight web framework for the edge
- **TypeScript**: Type-safe development
- **GitHub Actions**: Automated deployment pipeline

## 🚀 Deployment

The project can be easily deployed through GitHub Actions:

1. Fork the repository
2. Configure custom domain in `wrangler.toml`
3. Set up Cloudflare API token and account ID in GitHub Secrets
4. Enable GitHub Actions
5. Deploy automatically or manually trigger the workflow

## 🌿 Built on Giants

This project leverages several powerful technologies:

- **Cloudflare Workers**: Edge computing platform
- **Hono**: Modern web framework
- **TypeScript**: Type-safe JavaScript
- **Wrangler**: Cloudflare Workers CLI tool
- **GitHub Actions**: CI/CD automation

## 🗂️ Github Repository

<style>
  td, th {
    vertical-align: middle;
  }
</style>

[github:yousiki/cloudflare-workers-mikan](https://github.com/yousiki/cloudflare-workers-mikan)

| Workflows                                                                                   | Description                  | Status                                                                                                 |
| ------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Deploy](https://github.com/yousiki/cloudflare-workers-mikan/actions/workflows/deploy.yaml) | Deploy to Cloudflare Workers | ![Deploy](https://github.com/yousiki/cloudflare-workers-mikan/actions/workflows/deploy.yaml/badge.svg) |

## 🔗 Live Demo

Visit the live mirror site at: [mikan.siki.moe](https://mikan.siki.moe)
