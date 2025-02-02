declare class DrapoFunctionHandler {
    private _application;
    get Application(): DrapoApplication;
    constructor(application: DrapoApplication);
    ResolveFunctionWithoutContext(sector: string, element: Element, functionsValue: string, executionContext?: DrapoExecutionContext<any>): Promise<string>;
    CreateExecutionContext(canReset?: boolean): DrapoExecutionContext<any>;
    private FinalizeExecutionContext;
    private IsExecutionBroked;
    ReplaceFunctionExpressions(sector: string, context: DrapoContext, expression: string, canBind: boolean): Promise<string>;
    private ReplaceFunctionExpressionsContext;
    ResolveFunction(sector: string, contextItem: DrapoContextItem, element: Element, event: JQueryEventObject, functionsValue: string, executionContext?: DrapoExecutionContext<any>, forceFinalizeExecutionContext?: boolean): Promise<string>;
    private ResolveFunctionContext;
    ResolveFunctionParameter(sector: string, contextItem: DrapoContextItem, element: Element, executionContext: DrapoExecutionContext<any>, parameter: string, canForceLoadDataDelay?: boolean, canUseReturnFunction?: boolean, isRecursive?: boolean): Promise<any>;
    ResolveExecutionContextMustache(sector: string, executionContext: DrapoExecutionContext<any>, value: string): string;
    ResolveFunctions(sector: string, contextItem: DrapoContextItem, element: Element, executionContext: DrapoExecutionContext<any>, value: string, checkInvalidFunction?: boolean): Promise<any>;
    private ResolveFunctionParameterDataFields;
    private ExecuteFunctionContextSwitch;
    private ExecuteFunctionExternal;
    private ExecuteFunctionSetExternal;
    private ExecuteFunctionGetExternal;
    private ExecuteFunctionSetExternalFrame;
    private ExecuteFunctionGetExternalFrame;
    private ExecuteFunctionSetExternalFrameMessage;
    private ExecuteFunctionGetExternalFrameMessage;
    private ExecuteFunctionToggleItemField;
    private ExecuteFunctionToggleData;
    private ExecuteFunctionUncheckItemField;
    private ExecuteFunctionClearItemField;
    private ExecuteFunctionUpdateItemField;
    private ExecuteFunctionCheckDataField;
    private ExecuteFunctionUncheckDataField;
    private ExecuteFunctionClearDataField;
    private ExecuteFunctionUpdateDataField;
    private ExecuteFunctionUpdateDataFieldLookup;
    private ExecuteFunctionCheckItemField;
    private ExecuteFunctionMoveItem;
    private ExecuteFunctionUpdateDataUrl;
    private ExecuteFunctionUpdateDataUrlSet;
    private ExecuteFunctionAddDataItem;
    private ExecuteFunctionRemoveDataItem;
    private ExecuteFunctionRemoveDataItemLookup;
    private ExecuteFunctionContainsDataItem;
    private ExecuteFunctionUpdateSector;
    private ExecuteFunctionSwitchSector;
    private ExecuteFunctionReloadSector;
    private ExecuteFunctionClearSector;
    private ExecuteFunctionLoadSectorContent;
    private ExecuteFunctionClearData;
    private ExecuteFunctionUnloadData;
    private ExecuteFunctionCreateData;
    private ExecuteFunctionUpdateData;
    private ExecuteFunctionReloadData;
    private ExecuteFunctionFilterData;
    private ExecuteFunctionHasDataChanges;
    private ExecuteFunctionAcceptDataChanges;
    private ExecuteFunctionPostData;
    private ExecuteFunctionPostDataItem;
    private ExecuteFunctionReloadPage;
    private ExecuteFunctionClosePage;
    private ExecuteFunctionRedirectPage;
    private ExecuteFunctionUpdateURL;
    private ExecuteFunctionUpdateToken;
    private ExecuteFunctionClearToken;
    private ExecuteFunctionHasToken;
    private ExecuteFunctionUpdateTokenAntiforgery;
    private ExecuteFunctionDestroyContainer;
    private ExecuteFunctionIf;
    private ExecuteFunctionAsync;
    private ExecuteFunctionNotify;
    private ExecuteFunctionFocus;
    private ExecuteFunctionShowWindow;
    private ExecuteFunctionCloseWindow;
    private ExecuteFunctionHideWindow;
    private ExecuteFunctionGetWindow;
    private ExecuteFunctionCreateGuid;
    private ExecuteFunctionCreateTick;
    private ExecuteFunctionPushStack;
    private ExecuteFunctionPopStack;
    private ExecuteFunctionPeekStack;
    private ExecuteFunctionExecute;
    private ExecuteFunctionExecuteDataItem;
    private ExecuteFunctionExecuteComponentFunction;
    private ExecuteFunctionExecuteInstanceFunction;
    private ExecuteFunctionCast;
    private ExecuteFunctionEncodeUrl;
    private ExecuteFunctionAddRequestHeader;
    private ExecuteFunctionSetClipboard;
    private ExecuteFunctionCreateTimer;
    private ExecuteFunctionCreateReference;
    private ExecuteFunctionWait;
    private ExecuteFunctionDownloadData;
    private DownloadData;
    private CreateBlob;
    private ExecuteFunctionDetectView;
    private ExecuteFunctionSetConfig;
    private ExecuteFunctionGetConfig;
    private ExecuteFunctionLockPlumber;
    private ExecuteFunctionUnlockPlumber;
    private ExecuteFunctionLockData;
    private ExecuteFunctionUnlockData;
    private ExecuteFunctionClearPlumber;
    private ExecuteFunctionDebugger;
    private ExecuteFunctionGetSector;
    private ExecuteFunctionGetClipboard;
    private ExecuteFunctionExecuteValidation;
    private ExecuteFunctionClearValidation;
    HasFunctionMustacheContext(functionsValue: string, sector: string, renderContext: DrapoRenderContext): Promise<boolean>;
    private HasFunctionMustacheContextInternal;
    private HasFunctionsContext;
    private GetFunctionsContext;
    private IsFunctionContext;
}
