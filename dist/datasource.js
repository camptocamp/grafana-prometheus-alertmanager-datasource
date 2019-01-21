"use strict";

System.register(["lodash"], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function dsRegularEscape(value) {
    if (typeof value === 'string') {
      return value.replace(/'/g, "\\\\'");
    }
    return value;
  }

  _export("dsRegularEscape", dsRegularEscape);

  function dsSpecialRegexEscape(value) {
    if (typeof value === 'string') {
      return dsRegularEscape(value.replace(/\\/g, '\\\\\\\\').replace(/[$^*{}\[\]+?.()]/g, '\\\\$&'));
    }
    return value;
  }

  _export("dsSpecialRegexEscape", dsSpecialRegexEscape);

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

          this.severityLevels = {};
          if (instanceSettings.jsonData.severity_critical != undefined) {
            this.severityLevels[instanceSettings.jsonData.severity_critical.toLowerCase()] = 4;
          }
          if (instanceSettings.jsonData.severity_high != undefined) {
            this.severityLevels[instanceSettings.jsonData.severity_high.toLowerCase()] = 3;
          }
          if (instanceSettings.jsonData.severity_warning != undefined) {
            this.severityLevels[instanceSettings.jsonData.severity_warning.toLowerCase()] = 2;
          }
          if (instanceSettings.jsonData.severity_info != undefined) {
            this.severityLevels[instanceSettings.jsonData.severity_info.toLowerCase()] = 1;
          }
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
              var labelSelector = this.parseLabelSelector(query.targets[0].labelSelector);
              var filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars, this.interpolateQueryExpr) || "");
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
                  var columnsDict = _this.getColumnsDict(response.data.data, labelSelector);
                  results.data[0].columns = _this.getColumns(columnsDict);

                  for (var i = 0; i < response.data.data.length; i++) {
                    var row = new Array(results.data[0].columns.length).fill("");
                    var item = response.data.data[i];
                    row[0] = [Date.parse(item['startsAt'])];

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                      for (var _iterator = Object.keys(item['labels'])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var label = _step.value;

                        if (label in columnsDict) {
                          if (label === 'severity') {
                            row[columnsDict[label]] = _this.severityLevels[item['labels'][label]];
                          } else {
                            row[columnsDict[label]] = item['labels'][label];
                          }
                        }
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
                      for (var _iterator2 = Object.keys(item['annotations'])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var annotation = _step2.value;

                        if (annotation in columnsDict) {
                          row[columnsDict[annotation]] = item['annotations'][annotation];
                        }
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

                    results.data[0].rows.push(row);
                  }
                }
                return results;
              });
            } else {
              var _filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars, this.interpolateQueryExpr) || "");
              return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter=' + _filter,
                data: query,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }).then(function (response) {
                return {
                  "data": [{ "datapoints": [[response.data.data.length, Date.now()]] }]
                };
              });
            }
          }
        }, {
          key: "interpolateQueryExpr",
          value: function interpolateQueryExpr(value, variable, defaultFormatFn) {
            if (typeof value === 'string') {
              return dsSpecialRegexEscape(value);
            }

            var escapedValues = _.map(value, dsSpecialRegexEscape);
            return escapedValues.join('|');
          }
        }, {
          key: "getColumns",
          value: function getColumns(columnsDict) {
            var columns = [{ text: "Time", type: "time" }];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = Object.keys(columnsDict)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var column = _step3.value;

                columns.push({ text: column, type: "string" });
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            return columns;
          }
        }, {
          key: "parseLabelSelector",
          value: function parseLabelSelector(input) {
            var map;
            if (typeof input === "undefined" || input.trim().length === 0) {
              map = ["*"];
            } else {
              map = input.trim().split(/\s*,\s*/);
            }
            return map;
          }
        }, {
          key: "getColumnsDict",
          value: function getColumnsDict(data, labelSelector) {
            var index = 1; // 0 is the data column
            var columnsDict = {};
            var severityDefined = false;
            for (var i = 0; i < data.length; i++) {
              for (var labelIndex = 0; labelIndex < labelSelector.length; labelIndex++) {
                var selectedLabel = labelSelector[labelIndex];
                if (selectedLabel === "*") {
                  var _iteratorNormalCompletion4 = true;
                  var _didIteratorError4 = false;
                  var _iteratorError4 = undefined;

                  try {
                    // '*' maps to all labels/annotations not already added via the label selector list
                    for (var _iterator4 = Object.keys(data[i]['labels'])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                      var label = _step4.value;

                      if (!(label in columnsDict)) {
                        if (label === 'severity') {
                          severityDefined = true;
                        }
                        columnsDict[label] = index++;
                      }
                    }
                  } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                      }
                    } finally {
                      if (_didIteratorError4) {
                        throw _iteratorError4;
                      }
                    }
                  }

                  var _iteratorNormalCompletion5 = true;
                  var _didIteratorError5 = false;
                  var _iteratorError5 = undefined;

                  try {
                    for (var _iterator5 = Object.keys(data[i]['annotations'])[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                      var annotation = _step5.value;

                      if (!(annotation in columnsDict)) {
                        columnsDict[annotation] = index++;
                      }
                    }
                  } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                      }
                    } finally {
                      if (_didIteratorError5) {
                        throw _iteratorError5;
                      }
                    }
                  }
                } else if (!(selectedLabel in columnsDict)) {
                  if (selectedLabel === 'severity') {
                    severityDefined = true;
                  }
                  columnsDict[selectedLabel] = index++;
                }
              }
            }
            if (!severityDefined) {
              columnsDict['severity'] = index++;
            }
            return columnsDict;
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
