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
            if (query.targets[0].type === "table") {
              var filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars) || "");
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter=' + filter,
                data: query,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }).then(function (response) {
                var results = {
                  "data": [{
                    "rows": [],
                    "columns": [],
                    "type": "table"
                  }]
                };

                if (response.data && response.data.data && response.data.data.length) {
                  var severity = response.data.data[0].labels.severity;
                  delete response.data.data[0].labels.severity;
                  results.data[0].columns = _this.getColumns(response.data.data[0]);
                  //console.log('here');
                  for (var i = 0; i < response.data.data.length; i++) {
                    //console.log('here' + i);

                    var item = response.data.data[i];
                    delete item.labels.severity;
                    var labelValues = Object.values(item.labels);
                    var annotationValues = Object.values(item.annotations);
                    var row = [Date.parse(item.startsAt)].concat(labelValues).concat(annotationValues);
                    row.push([_this.severityLevels[severity]]);
                    results.data[0].rows.push(row);
                  }
                }
                //console.log(JSON.stringify(results));
                return results;
              });
            } else {
              var _filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars) || "");
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter=' + _filter,
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
          key: "getColumns",
          value: function getColumns(dataRow) {
            var columns = [{ text: "Time", type: "time" }];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = Object.keys(dataRow.labels)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var label = _step.value;

                columns.push({ text: label, type: "string" });
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = Object.keys(dataRow['annotations'])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var annotation = _step2.value;

                columns.push({ text: annotation, type: "string" });
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            columns.push({ text: "severity", type: "string" });
            return columns;
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
            options.targetss = _.map(options.targets, function (target) {
              return {
                target: _this2.templateSrv.replace(target.target),
                expr: target.expr,
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'single',
                legendFormat: target.legendFormat || ""
              };
            });
            return options;
          }
        }, {
          key: "formatInstanceText",
          value: function formatInstanceText(labels, legendFormat) {
            if (legendFormat === "") {
              return JSON.stringify(labels);
            }
            var aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
            return legendFormat.replace(aliasRegex, function (match, g1) {
              if (labels[g1]) {
                return labels[g1];
              }
              return "";
            });
          }
        }]);

        return GenericDatasource;
      }());

      _export("GenericDatasource", GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
