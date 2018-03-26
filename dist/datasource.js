"use strict";

System.register(["lodash"], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export("GenericDatasource", GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.severityLevels = {};
          this.severityLevels[instanceSettings.jsonData.severity.critical.toLowerCase()] = 3;
          this.severityLevels[instanceSettings.jsonData.severity.warning.toLowerCase()] = 2;
          this.severityLevels[instanceSettings.jsonData.severity.info.toLowerCase()] = 1;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: "query",
          value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }
            // Format data for table panel
            if (query.targets[0].type == "table") {
              var filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars) || "");
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter=' + filter,
                data: query,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }).then(function (response) {
                var results = {
                  "data": [{
                    "columns": [{ "text": "Time", "type": "time" }, { "text": "Message", "type": "string" }, { "text": "Alertname", "type": "string" }, { "text": "Severity", "type": "string" }],
                    "rows": [],
                    "type": "table"
                  }]
                };
                for (var i = 0; i < response.data.data.length; i++) {
                  var item = response.data.data[i];
                  var text = Object.assign({}, item.annotations, item.labels);
                  results.data[0].rows.push([Date.parse(item.startsAt), _this.formatInstanceText(text, query.targets[0].legendFormat), item.labels.alertname, _this.severityLevels[item.labels.severity]]);
                };
                return results;
              });
            } else {
              var filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars) || "");
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter=' + filter,
                data: query,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }).then(function (response) {
                return {
                  "data": [{
                    "datapoints": [[response.data.data.length, Date.now()]]
                  }]
                };
              });
            }
          }
        }, {
          key: "testDatasource",
          value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/api/v1/status',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: "buildQueryParameters",
          value: function buildQueryParameters(options) {
            var _this2 = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });
            var targets = _.map(options.targets, function (target) {
              return {
                target: _this2.templateSrv.replace(target.target),
                expr: target.expr,
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'single',
                legendFormat: target.legendFormat || ""
              };
            });
            options.targets = targets;
            return options;
          }
        }, {
          key: "formatInstanceText",
          value: function formatInstanceText(labels, legendFormat) {
            if (legendFormat == "") {
              return JSON.stringify(labels);
            }
            var aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
            var text = legendFormat.replace(aliasRegex, function (match, g1) {
              if (labels[g1]) {
                return labels[g1];
              }
              return "";
            });
            return text;
          }
        }]);

        return GenericDatasource;
      }());

      _export("GenericDatasource", GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
