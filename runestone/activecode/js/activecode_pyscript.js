import { ActiveCode } from "./activecode.js";

export default class PyScriptActiveCode extends ActiveCode {
    constructor(opts) {
        super(opts);
        opts.alignVertical = true;
        this.python3_interpreter = $(orig).data("python3_interpreter");
        $(this.runButton).text("Render");
        this.editor.setValue(this.code);
    }

    async runProg() {
        var prog = await this.buildProg(true);
        let saveCode = "True";
        this.saveCode = await this.manage_scrubber(saveCode);
        $(this.output).text("");
        if (!this.alignVertical) {
            $(this.codeDiv).switchClass("col-md-12", "col-md-6", {
                duration: 500,
                queue: false,
            });
        }
        $(this.outDiv).show({ duration: 700, queue: false });
        prog = `
        <html>
        <head>
            <link rel="stylesheet" href="https://pyscript.net/latest/pyscript.css" />
            <script defer src="https://pyscript.net/latest/pyscript.js"></script>
            <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/styles/default.min.css">
            <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/highlight.min.js"></script>
            <style>
                #console {
                    width: 100%;
                    height: 150px;
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    font-family: monospace;
                    background-color: #f5f5f5;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    overflow-y: auto;
                }
                #plot_area {
                    width: 100%;
                    height: 500px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    background-color: #f8f8f8;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #plot_area img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
            </style>
        </head>
        <body>
            <py-config>
                terminal = false
                packages = ["pandas", "numpy", "matplotlib", "sympy"]
            </py-config>
            <div id="console"></div>
            <div id="plot_area"></div>
            <py-script>
import sys
from js import document
import matplotlib.pyplot as plt
import io
import base64

class NewOut:
    def write(self, data):
        display(data, "console")
sys.stderr = sys.stdout = NewOut()

def display(obj, target="console"):
    target_div = document.getElementById(target)
    if not target_div:
        raise ValueError(f"Target div '{target}' not found")

    if target == "plot_area":
        if isinstance(obj, plt.Figure):
            fig = obj
        else:
            fig = plt.gcf()
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        target_div.innerHTML = f'<img src="data:image/png;base64,{img_str}" />'
        plt.close(fig)
    elif target == "console":
        target_div.innerHTML += str(obj) + '\\n'
        target_div.scrollTop = target_div.scrollHeight

def my_exec(code):
    try:
        exec(code)
    except Exception as err:
        error_class = err.__class__.__name__
        detail = err.args[0]
        result = f"'{error_class}': {detail}"
        display(result, "console")

# usage
my_exec("""${prog}
""")
            </py-script>
            <script>
                hljs.highlightAll();
            </script>
        </body>
        </html>
        `;
        this.output.srcdoc = prog;
    }

    createOutput() {
        this.alignVertical = true;
        var outDiv = document.createElement("div");
        $(outDiv).addClass("ac_output");
        if (this.alignVertical) {
            $(outDiv).addClass("col-md-12");
        } else {
            $(outDiv).addClass("col-md-5");
        }
        this.outDiv = outDiv;

        this.output = document.createElement("iframe");
        $(this.output).css({
            "background-color": "white",
            "position": "relative",
            "height": "750px",
            "width": "100%"
        });
        outDiv.appendChild(this.output);

        this.outerDiv.appendChild(outDiv);
        var clearDiv = document.createElement("div");
        $(clearDiv).css("clear", "both");
        this.outerDiv.appendChild(clearDiv);
    }

    enableSaveLoad() {
        $(this.runButton).text($.i18n("msg_activecode_render"));
    }
}