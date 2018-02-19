# Grafana datasource for Prometheus Alertmanager

This datasource lets you to use the Alertmanager's API of Prometheus to create dashboards in Grafana.

![Overview](https://raw.githubusercontent.com/camptocamp/grafana-prometheus-alertmanager-datasource/master/images/overview.png)


# Panels

The only two formats available are **table** and **single**.

# Usage

Into the query expression field, you can set filters.

Examples:

 - `alertname="HostDown"` will only display alerts which has the label *alertname* equals to "HostDown".
 - `severity="1"` will only display alerts which has the label *severity* equals to "1".

You can also set multiple parameters like `alertname="DiskFull", df="opt"`.

![Parameters](https://raw.githubusercontent.com/camptocamp/grafana-prometheus-alertmanager-datasource/master/images/table.png)

You can display one label or more into the message field by setting labels name into the "Legend format" field.

Example:

 - `{{msg}}` will display the content of the label "msg".
 - `Host: {{host}} / IP: {{ip}}` will display the following content: "Host: [host_value] / IP: [ip_value]"


*To set labels in your alerts, you can follow the Prometheus's documentation: [https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/).*
