export default function tmpl(markup: string) {

    const template = document.createElement("template");
    template.innerHTML = markup;

    const HTML = template.content;

    function getRef<T extends Element>(
        name: string,
        elementType: { new (): T },
    ): T {
        
		const element = HTML.querySelector(
            `[ref="${CSS.escape(name)}"]`,
        );

        if (!element) {
            throw new Error(`Template is missing ref="${name}"`);
        }

        if (!(element instanceof elementType)) {
            throw new Error(
                `Template ref="${name}" must be ${elementType.name}`,
            );
        }

        return element;
    }

    return { HTML, getRef };

}