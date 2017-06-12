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
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: "query",
          value: function query(options) {
            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }

            // Format data for table panel
            if (query.targets[0].type == "table") {
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?filter=' + encodeURIComponent(query.targets[0].expr || ""),
                data: query,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }).then(function (response) {
                var results = {
                  "data": [{
                    "columns": [{ "text": "Time", "type": "time" }, { "text": "Instance", "type": "string" }, { "text": "Alertname", "type": "string" }, { "text": "Severity", "type": "Number" }],
                    "rows": [],
                    "type": "table"
                  }]
                };
                response.data.data.forEach(function (item) {
                  results.data[0].rows.push([Date.parse(item.startsAt), item.labels.instance + " (" + item.labels.rancher_host + ")", item.labels.alertname, 1]);
                });
                return results;
              });
            } else {
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?filter=' + encodeURIComponent(query.targets[0].expr || ""),
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
            var _this = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });
            var targets = _.map(options.targets, function (target) {
              return {
                target: _this.templateSrv.replace(target.target),
                expr: target.expr,
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie'
              };
            });
            options.targets = targets;
            return options;
          }
        }]);

        return GenericDatasource;
      }());

      _export("GenericDatasource", GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
