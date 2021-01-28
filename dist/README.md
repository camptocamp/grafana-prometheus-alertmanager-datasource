# Grafana datasource for Prometheus Alertmanager

This datasource lets you to use the Alertmanager's API of Prometheus to create dashboards in Grafana.

![Overview](images/overview.png)

# Usage

Into the query expression field, you can set filters.

Examples:

 - `alertname="HostDown"` will only display alerts which has the label *alertname* equals to "HostDown".
 - `severity="1"` will only display alerts which has the label *severity* equals to "1".

You can also set multiple parameters like `alertname="DiskFull",df="opt"`.

Alerts can be filtered by their status like `active`, `silenced` or `inhibited`.

![Parameters](images/table.png)

# Development Setup

Usage of Yarn is encouraged to build.

```shell
$ yarn install
$ yarn run build
```
