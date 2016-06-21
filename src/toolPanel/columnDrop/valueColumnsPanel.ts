import {
    Utils,
    SvgFactory,
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    PostConstruct,
    Events,
    Column
} from "ag-grid/main";
import {AbstractColumnDropPanel} from "./abstractColumnDropPanel";

var svgFactory = SvgFactory.getInstance();

export class ValuesColumnPanel extends AbstractColumnDropPanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    constructor(horizontal: boolean) {
        super(horizontal, true);
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to aggregate');
        var title = localeTextFunc('values', 'Values');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_AGGREGATE,
            iconFactory: svgFactory.createAggregationIcon,
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    }

    protected isColumnDroppable(column: Column): boolean {
        var columnValue = column.isMeasure();
        var columnNotValue= !column.isAggregationActive();
        return columnValue && columnNotValue;
    }

    protected removeColumns(columns: Column[]): void {
        var columnsCurrentlyValueColumns = Utils.filter(columns, (column: Column) => column.isAggregationActive() );
        this.columnController.removeAggregationColumns(columnsCurrentlyValueColumns);
    }

    protected addColumns(columns: Column[]) {
        this.columnController.addAggregationColumns(columns);
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getAggregationColumns();
    }

}