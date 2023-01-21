

export class CollectorService {
    static collectors = [];

    constructor() {
        CollectorService.collectors++;
        console.log(CollectorService.collectors);
    }
}