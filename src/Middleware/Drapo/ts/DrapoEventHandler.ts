class DrapoEventHandler {
    //Field
    private _application: DrapoApplication;
    private readonly _debounceDefault: number = 500;
    private readonly _debounceDefaultClick: number = 200;
    private readonly _debounce: string = 'debounce';
    private readonly _detach: string = 'detach';
    private _eventsRunning: HTMLElement[] = [];

    //Properties
    get Application(): DrapoApplication {
        return (this._application);
    }

    //Constructors
    constructor(application: DrapoApplication) {
        this._application = application;
    }

    public HasContentEventContext(content: string): boolean {
        return (content.indexOf('d-on-') > -1);
    }

    public CreateEventNamespace(el: HTMLElement, location: string, eventType: string, namespace: string): string {
        if (eventType === 'load')
            return (eventType);
        if (location === null)
            return (eventType + '.' + namespace);
        const did: string = this.Application.Document.EnsureElementHasID(el);
        return (eventType + '.' + did);
    }

    public GetEventPropagation(el: HTMLElement, eventType: string): boolean {
        const propagationValue: string = el.getAttribute('d-propagation-' + eventType);
        if (propagationValue == null)
            return (true);
        return (this.Application.Solver.ResolveConditionalBoolean(propagationValue));
    }

    private RetrieveEventBinder(elementJQuery: JQuery, location: string): JQuery {
        if (location == null)
            return (elementJQuery);
        if (this.IsLocationBody(location))
            return ($(document));
        return (null);
    }

    private IsLocationBody(location: string): boolean {
        return (location === 'body');
    }

    public GetElementParent(element: Element, levels: number = 0): JQuery {
        let current: Element = element;
        for (let i: number = 0; (i < levels) && (current != null); i++)
            current = current.parentElement;
        if (current == null)
            return (null);
        if (current.tagName.toLowerCase() === 'body')
            return ($(document.body));
        return ($(current));
    }

    public async Attach(el: HTMLElement, renderContext: DrapoRenderContext): Promise<void> {
        //Events
        const events: [string, string, string, string, string, string][] = this.RetrieveElementEvents(el);
        if (events.length == 0)
            return;
        const application: DrapoApplication = this.Application;
        const elj: JQuery = $(el);
        const sector: string = await this.Application.Document.GetSectorResolved(el);
        const isSectorDynamic: boolean = await this.Application.Document.IsSectorDynamic(el);
        for (let i = 0; i < events.length; i++) {
            const event: [string, string, string, string, string, string] = events[i];
            const eventType: string = event[2];
            if (!this.IsEventTypeValid(eventType))
                continue;
            const functionsValue: string = event[3];
            if ((!isSectorDynamic) && (await this.HasEventContext(sector, renderContext, functionsValue, event[5])))
                continue;
            const eventFilter: string = event[4];
            const location: string = event[1];
            const isLocationBody = this.IsLocationBody(location);
            const eventNamespace = this.CreateEventNamespace(el, location, eventType, 'noContext');
            const binder: JQuery = this.RetrieveEventBinder(elj, location);
            if (binder === null)
                continue;
            const propagation: boolean = this.GetEventPropagation(el, eventType);
            let isDelay: boolean = this.IsEventDelay(el, eventType);
            let debounceTimeout: number = this._debounceDefaultClick;
            const elDebounceTimeout: number = isDelay ? null : this.GetEventDebounce(el, eventType);
            if (elDebounceTimeout !== null) {
                isDelay = true;
                debounceTimeout = elDebounceTimeout;
            }
            let delayTimeout: number = null;
            //Detach
            const eventsDetach: string[] = this.GetEventDetach(el, eventType);
            let eventsDetachActivated: boolean = false;
            const eventAttribute: string = event[0];
            binder.unbind(eventNamespace);
            binder.bind(eventNamespace, async (e) => {
                if ((isLocationBody) && (!application.Document.Contains(elj))) {
                    binder.unbind(eventNamespace);
                    return (true);
                }
                if (!application.EventHandler.IsValidEventFilter(e, eventFilter))
                    return (true);
                //Sector
                const sectorEvent: string = isSectorDynamic ? await this.Application.Document.GetSectorResolved(el) : sector;
                //Validation
                if (!(await this.Application.Validator.IsValidationEventValid(el, sectorEvent, eventType, location, e, null)))
                    return (true);
                if (eventsDetachActivated)
                    return (true);
                if (eventsDetach != null) {
                    for (let j: number = 0; j < eventsDetach.length; j++) {
                        const eventDetach: string = eventsDetach[j];
                        const eventDetachNamespace: string = this.CreateEventNamespace(el, null, eventDetach, 'noContext');
                        binder.unbind(eventDetachNamespace);
                        if (eventDetach === eventType)
                            eventsDetachActivated = true;
                    }
                }
                const functionsValueCurrent: string = el.getAttribute(eventAttribute);
                if (!isDelay) {
                    // tslint:disable-next-line:no-floating-promises
                    application.EventHandler.ExecuteEvent(sector, null, el, e, functionsValueCurrent, isSectorDynamic);
                } else {
                    if (delayTimeout != null)
                        clearTimeout(delayTimeout);
                    delayTimeout = setTimeout(() => {
                        clearTimeout(delayTimeout);
                        delayTimeout = null;
                        // tslint:disable-next-line:no-floating-promises
                        application.EventHandler.ExecuteEvent(sector, null, el, e, functionsValueCurrent, isSectorDynamic);
                    }, debounceTimeout);
                }
                return (propagation);
            });
        }
    }

    public async AttachContext(context: DrapoContext, el: HTMLElement, elj: JQuery, sector: string, renderContext: DrapoRenderContext): Promise<void> {
        //Events
        const events: [string, string, string, string, string, string][] = this.RetrieveElementEvents(el);
        if (events.length == 0)
            return;
        const application: DrapoApplication = this.Application;
        const contextItem: DrapoContextItem = context.Item;
        for (let i = 0; i < events.length; i++) {
            const event: [string, string, string, string, string, string] = events[i];
            const eventType: string = event[2];
            if (!this.IsEventTypeValid(eventType))
                continue;
            const functionsValueOriginal: string = event[3];
            if (!(await this.HasEventContext(sector, renderContext, functionsValueOriginal, event[5])))
                continue;
            const eventFilter: string = event[4];
            const location: string = event[1];
            const isLocationBody = this.IsLocationBody(location);
            const functionsValue: string = this.Application.Solver.ResolveSystemContextPath(sector, context, functionsValueOriginal);
            const eventNamespace: string = this.CreateEventNamespace(el, location, eventType, 'context');
            const binder: JQuery = this.RetrieveEventBinder(elj, location);
            if (binder === null)
                continue;
            const propagation: boolean = this.GetEventPropagation(el, eventType);
            let isDelay: boolean = this.IsEventDelay(el, eventType);
            let debounceTimeout: number = this._debounceDefaultClick;
            const elDebounceTimeout: number = isDelay ? null : this.GetEventDebounce(el, eventType);
            if (elDebounceTimeout !== null) {
                isDelay = true;
                debounceTimeout = elDebounceTimeout;
            }
            let delayTimeout: number = null;
            //Detach
            const eventsDetach: string[] = this.GetEventDetach(el, eventType);
            let eventsDetachActivated: boolean = false;
            binder.unbind(eventNamespace);
            binder.bind(eventNamespace, async (e) => {
                if ((isLocationBody) && (!application.Document.Contains(elj))) {
                    binder.unbind(eventNamespace);
                    return (true);
                }
                if (!application.EventHandler.IsValidEventFilter(e, eventFilter))
                    return (true);
                //Sector
                const sectorLocal: string = application.Document.GetSector(e.target as HTMLElement);
                //Validation
                if (!(await this.Application.Validator.IsValidationEventValid(el, sectorLocal, eventType, location, e, contextItem)))
                    return (true);
                if (eventsDetachActivated)
                    return (true);
                if (eventsDetach != null) {
                    for (let j: number = 0; j < eventsDetach.length; j++) {
                        const eventDetach: string = eventsDetach[j];
                        const eventDetachNamespace: string = this.CreateEventNamespace(el, null, eventDetach, 'noContext');
                        binder.unbind(eventDetachNamespace);
                        if (eventDetach === eventType)
                            eventsDetachActivated = true;
                    }
                }
                if (!isDelay) {
                    // tslint:disable-next-line:no-floating-promises
                    application.EventHandler.ExecuteEvent(sectorLocal, contextItem, el, e, functionsValue);
                } else {
                    if (delayTimeout != null)
                        clearTimeout(delayTimeout);
                    delayTimeout = setTimeout(() => {
                        clearTimeout(delayTimeout);
                        delayTimeout = null;
                        // tslint:disable-next-line:no-floating-promises
                        application.EventHandler.ExecuteEvent(sectorLocal, contextItem, el, e, functionsValue);
                    }, debounceTimeout);
                }
                return (propagation);
            });
        }
    }

    private async HasEventContext(sector: string, renderContext: DrapoRenderContext, functionsValue: string, validation: string): Promise<boolean> {
        if (await this.Application.FunctionHandler.HasFunctionMustacheContext(functionsValue, sector, renderContext))
            return (true);
        if ((validation != null) && (await this.Application.FunctionHandler.HasFunctionMustacheContext(validation, sector, renderContext)))
            return (true);
        return (false);
    }

    private async ExecuteEvent(sector: string, contextItem: DrapoContextItem, element: HTMLElement, event: JQueryEventObject, functionsValue: string, isSectorDynamic: boolean = false): Promise<void> {
        try {
            //Single
            const isEventSingle: boolean = element.getAttribute('d-event-single') === 'true';
            if ((isEventSingle) && (this.IsEventRunning(element)))
                return;
            let eventSingleClass: string = null;
            if (isEventSingle) {
                this.AddEventRunning(element);
                eventSingleClass = element.getAttribute('d-event-single-class');
                if (eventSingleClass != null)
                    $(element).addClass(eventSingleClass);
            }
            //Sector
            const sectorEvent: string = isSectorDynamic ? await this.Application.Document.GetSectorResolved(element) : sector;
            //Event
            await this.Application.FunctionHandler.ResolveFunction(sectorEvent, contextItem, element, event, functionsValue);
            //Remove Event Running
            if (isEventSingle) {
                this.RemoveEventRunning(element);
                if (eventSingleClass != null)
                    $(element).removeClass(eventSingleClass);
            }
        } catch (e) {
            await this.Application.ExceptionHandler.Handle(e, 'DrapoEventHandler - ExecuteEvent');
        }
    }

    private IsEventRunning(element: HTMLElement): boolean {
        for (let i: number = this._eventsRunning.length - 1; i >= 0; i--) {
            const elementCurrent: HTMLElement = this._eventsRunning[i];
            if (elementCurrent === element)
                return (true);
        }
        return (false);
    }

    private AddEventRunning(element: HTMLElement): void {
        this._eventsRunning.push(element);
    }

    private RemoveEventRunning(element: HTMLElement): void {
        for (let i: number = this._eventsRunning.length - 1; i >= 0; i--) {
            const elementCurrent: HTMLElement = this._eventsRunning[i];
            if (elementCurrent === element)
                this._eventsRunning.splice(i, 1);
        }
    }

    private IsEventTypeValid(eventType: string): boolean {
        if (eventType == 'click')
            return (true);
        if (eventType == 'change')
            return (true);
        if (eventType == 'keyup')
            return (true);
        if (eventType == 'blur')
            return (true);
        if (eventType == 'dblclick')
            return (true);
        if (eventType == 'input')
            return (true);
        if (eventType == 'load')
            return (true);
        if (eventType == 'mousedown')
            return (true);
        if (eventType == 'mouseover')
            return (true);
        if (eventType == 'mouseup')
            return (true);
        if (eventType === 'model')
            return (false);
        // tslint:disable-next-line:no-floating-promises
        this.Application.ExceptionHandler.HandleError('DrapoEventHandler - EventType Unknown - {0}', eventType);
        return (false);
    }

    private IsEventDelay(el: HTMLElement, eventType: string): boolean {
        if (eventType !== 'click')
            return (false);
        return (this.HasEventDoubleClickInParent(el));
    }

    public GetEventDebounce(el: HTMLElement, eventType: string): number {
        const elEventTypeDebounce: string = el.getAttribute('d-on-' + eventType + '-' + this._debounce);
        if ((elEventTypeDebounce == null) || (elEventTypeDebounce == ''))
            return (null);
        if (elEventTypeDebounce === 'true')
            return (this._debounceDefault);
        return (this.Application.Parser.ParseNumber(elEventTypeDebounce, this._debounceDefault));
    }

    public GetEventDetach(el: HTMLElement, eventType: string): string[] {
        const elEventTypeDetach: string = el.getAttribute('d-on-' + eventType + '-' + this._detach);
        if ((elEventTypeDetach == null) || (elEventTypeDetach == ''))
            return (null);
        if (elEventTypeDetach === 'true')
            return ([eventType]);
        return (this.Application.Parser.ParsePipes(elEventTypeDetach));
    }

    private HasEventDoubleClickInParent(el: HTMLElement): boolean {
        if (el == null)
            return (false);
        const doubleClickEvent: string = el.getAttribute('d-on-dblclick');
        if ((doubleClickEvent != null) && (doubleClickEvent != ''))
            return (true);
        return (this.HasEventDoubleClickInParent(el.parentElement));
    }

    private IsEventTypeKeyboard(eventType: string) {
        return (eventType == 'keyup');
    }

    public IsValidEventFilter(e: Event, eventFilter: string) {
        if (eventFilter == null)
            return (true);
        if (this.IsEventTypeKeyboard(e.type))
            return (this.IsValidEventFilterKeyboard(e as KeyboardEvent, eventFilter));
        return (true);
    }

    private IsValidEventFilterKeyboard(e: KeyboardEvent, eventFilter: string) {
        return (this.GetKeyboardMapping(e.key) == this.GetKeyboardMapping(eventFilter));
    }

    private GetKeyboardMapping(key: string): string {
        if (key == null)
            return (null);
        key = key.toLowerCase();
        if (key === 'esc')
            key = 'escape';
        if (key === 'del')
            key = 'delete';
        return (key);
    }

    private RetrieveElementEvents(el: HTMLElement): [string, string, string, string, string, string][] {
        const events: [string, string, string, string, string, string][] = [];
        for (let i: number = 0; i < el.attributes.length; i++) {
            const attribute: Attr = el.attributes[i];
            const event: [string, string, string, string, string, string] = this.Application.Parser.ParseEventProperty(el, attribute.nodeName, attribute.nodeValue);
            if ((event != null) && (event[4] !== this._debounce) && (event[4] !== this._detach))
                events.push(event);
        }
        return (events);
    }

    public async TriggerClick(el: HTMLElement): Promise<boolean> {
        return (await this.Trigger(el, 'click'));
    }

    public async Trigger(el: HTMLElement, type: string): Promise<boolean> {
        const event: Event = new Event(type);
        return(await this.TriggerEvent(el, event));
    }

    public async TriggerEvent(el: HTMLElement, event: Event): Promise<boolean> {
        return(el.dispatchEvent(event));
    }
}
