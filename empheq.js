MathJax.Extension['TeX/empheq'] = {
  version: '1.0.0'
};

MathJax.Hub.Register.StartupHook('TeX Jax Ready', function() {
  var TEX = MathJax.InputJax.TeX;
  TEX.Definitions.Add({
    environment: {
      empheq: ['ExtensionEnv', null, 'AMSmath']
    }
  });
});

MathJax.Hub.Register.StartupHook('TeX AMSmath Ready', function() {
  var MML = MathJax.ElementJax.mml,
    TEX = MathJax.InputJax.TeX,
    STACKITEM = TEX.Stack.Item;
  var EMPHEQ = MathJax.Extension['TeX/empheq'];

  EMPHEQ.copyMML = function(node) {
    if (!node) return null;
    var mml = new node.constructor().With(node);
    delete mml.id;
    if (node.data.length && node.data[0] instanceof MathJax.Object) {
      mml.data = [];
      for (var i = 0, m = node.data.length; i < m; i++) {
        mml.Append(this.copyMML(node.data[i]));
      }
    } else {
      mml.data = node.data.slice(0);
    }
    return mml;
  };

  EMPHEQ.splitOptions = function(text) {
    var options = {};
    var value = '',
      key,
      state = 'key',
      braces = 0;
    (text + ',').split(/([{}=,])/).forEach(function(c) {
      switch (c) {
        case '{':
          braces++;
          value += c;
          break;

        case '}':
          if (braces) braces--;
          value += c;
          break;

        case '=':
          if (state === 'key' && !braces) {
            key = value.trim();
            state = 'value';
            value = '';
          } else {
            value += c;
          }
          break;

        case ',':
          if (state === 'value' && !braces) {
            if (key !== 'left' && key !== 'right') {
              TEX.Error(['BadEmphEqOption', 'Unknown option %1', key]);
            }
            options[key] = value;
            value = '';
            state = 'key';
          } else {
            value += c;
          }
          break;

        default:
          value += c;
          break;
      }
    });
    if (braces) {
      TEX.Error([
        'ExtraOpenMissingClose',
        'Extra open brace or missing close brace'
      ]);
    }
    if (state === 'key' && value.trim()) {
      TEX.Error(['OptionsIncomplete', 'Option list is incomplete']);
    }
    return options;
  };

  EMPHEQ.columnCount = function(table) {
    var m = 0;
    table.data.forEach(function(row) {
      var n = row.data.length - (row.type === 'mlabeledtr' ? 1 : 0);
      if (n > m) m = n;
    });
    return m;
  };

  EMPHEQ.cellBlock = function(tex, table, stack) {
    var mpadded = MML.mpadded().With({
      height: 0,
      depth: 0,
      voffset: '-1height'
    });
    var result = TEX.Parse(tex, stack.env);
    var mml = result.mml();
    if (result.stack.global.label)
      stack.global.label = result.stack.global.label;
    mpadded.Append.apply(mpadded, mml.inferred ? mml.data : [mml]);
    mpadded.Append(MML.mphantom(MML.mpadded(table).With({ width: 0 })));
    return mpadded;
  };

  EMPHEQ.topRowTable = function(original) {
    var table = EMPHEQ.copyMML(original);
    table.data = table.data.slice(0, 1);
    table.align = 'baseline 1';
    return MML.mphantom(MML.mpadded(table).With({ width: 0 }));
  };

  EMPHEQ.rowspanCell = function(mtd, tex, table, stack) {
    mtd.Append(
      MML.mpadded(
        EMPHEQ.cellBlock(tex, EMPHEQ.copyMML(table), stack),
        EMPHEQ.topRowTable(table)
      ).With({ height: 0, depth: 0, voffset: 'height' })
    );
  };

  EMPHEQ.Left = function(table, original, left, stack) {
    table.columnalign = 'right ' + (table.columnalign || '');
    table.columnspacing = '0em ' + (table.columnspacing || '');
    var mtd;
    table.data
      .slice(0)
      .reverse()
      .forEach(function(row) {
        mtd = MML.mtd();
        row.data.unshift(null);
        if (row.type === 'mlabeledtr') {
          row.SetData(0, row.data[1]);
          row.SetData(1, mtd);
        } else {
          row.SetData(0, mtd);
        }
      });
    EMPHEQ.rowspanCell(mtd, left, original, stack);
  };

  EMPHEQ.Right = function(table, original, right, stack) {
    if (table.data.length === 0) table.Append(MML.mtr());
    var m = EMPHEQ.columnCount(table);
    var row = table.data[0],
      mtd = MML.mtd();
    while (row.data.length < m) row.Append(MML.mtd());
    row.Append(mtd);
    EMPHEQ.rowspanCell(mtd, right, original, stack);
    table.columnalign =
      (table.columnalign || '')
        .split(/ /)
        .slice(0, m)
        .join(' ') + ' left';
    table.columnspacing =
      (table.columnspacing || '')
        .split(/ /)
        .slice(0, m - 1)
        .join(' ') + ' 0em';
  };

  TEX.Definitions.Add({
    macros: {
      empheqlbrace: ['EmpheqMO', '{'],
      empheqrbrace: ['EmpheqMO', '}'],
      empheqlbrack: ['EmpheqMO', '['],
      empheqrbrack: ['EmpheqMO', ']'],
      empheqlangle: ['EmpheqMO', '\u27E8'],
      empheqrangle: ['EmpheqMO', '\u27E9'],
      empheqlparen: ['EmpheqMO', '('],
      empheqrparen: ['EmpheqMO', ')'],
      empheqlvert: ['EmpheqMO', '|'],
      empheqrvert: ['EmpheqMO', '|'],
      empheqlVert: ['EmpheqMO', '\u2016'],
      empheqrVert: ['EmpheqMO', '\u2016'],
      empheqlfloor: ['EmpheqMO', '\u230A'],
      empheqrfloor: ['EmpheqMO', '\u230B'],
      empheqlceil: ['EmpheqMO', '\u2308'],
      empheqrceil: ['EmpheqMO', '\u2309'],
      empheqbiglbrace: ['EmpheqMO', '{'],
      empheqbigrbrace: ['EmpheqMO', '}'],
      empheqbiglbrack: ['EmpheqMO', '['],
      empheqbigrbrack: ['EmpheqMO', ']'],
      empheqbiglangle: ['EmpheqMO', '\u27E8'],
      empheqbigrangle: ['EmpheqMO', '\u27E9'],
      empheqbiglparen: ['EmpheqMO', '('],
      empheqbigrparen: ['EmpheqMO', ')'],
      empheqbiglvert: ['EmpheqMO', '|'],
      empheqbigrvert: ['EmpheqMO', '|'],
      empheqbiglVert: ['EmpheqMO', '\u2016'],
      empheqbigrVert: ['EmpheqMO', '\u2016'],
      empheqbiglfloor: ['EmpheqMO', '\u230A'],
      empheqbigrfloor: ['EmpheqMO', '\u230B'],
      empheqbiglceil: ['EmpheqMO', '\u2308'],
      empheqbigrceil: ['EmpheqMO', '\u2309'],
      empheql: 'EmpheqDelim',
      empheqr: 'EmpheqDelim',
      empheqbigl: 'EmpheqDelim',
      empheqbigr: 'EmpheqDelim'
    },
    environment: {
      empheq: ['Empheq', ['EndEmpheq', 'EndInnerEmpheq']]
    }
  });

  TEX.Parse.Augment({
    EmpheqMO: function(name, c) {
      this.Push(MML.mo(c));
    },

    EmpheqDelim: function(name) {
      var c = this.GetDelimiter(name);
      this.Push(MML.mo(c).With({ stretchy: true, symmetric: true }));
    },

    Empheq: function(begin) {
      this.checkEqnEnv();
      this.stack.global.eqnenv = false;
      var opts = this.GetBrackets('\\begin{' + begin.name + '}') || '';
      var arg = (this.GetArgument('\\begin{' + begin.name + '}') || '').split(
        /=/
      );
      var env = arg[0],
        n = arg[1];
      if (!TEX.Definitions.environment.hasOwnProperty(env)) {
        TEX.Error(['UnknownEnv', 'Unknown environment "%1"', env]);
      }
      var options = opts ? EMPHEQ.splitOptions(opts) : {};
      options.env = env;
      this.string =
        '\\begin{' +
        env +
        '}' +
        (n ? '{' + n + '}' : '') +
        this.string.slice(this.i);
      this.i = 0;
      this.stack.global.empheq = options;
      this.Push(begin);
    },

    EndEmpheq: function(begin, data) {
      var options = this.stack.global.empheq;
      delete this.stack.global.empheq;
      if (options.left || options.right) {
        var table = data[0],
          original = EMPHEQ.copyMML(table);
        if (options.left)
          EMPHEQ.Left(table, original, options.left, this.stack);
        if (options.right)
          EMPHEQ.Right(table, original, options.right, this.stack);
      }
      return data;
    },

    EndInnerEmpheq: function(begin) {
      this.Push(STACKITEM.end().With({ name: this.stack.global.empheq.env }));
      this.Push(STACKITEM.end().With({ name: 'empheq' }));
    }
  });

  MathJax.Hub.Startup.signal.Post('TeX empheq Ready');
});

MathJax.Callback.Queue([
  'loadComplete',
  MathJax.Ajax,
  '[empheq-cases]/empheq.js'
]);
