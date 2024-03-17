class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    search() {
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i'
            }
        } : {};
        // Apply search conditions
        this.base = this.base.find({ ...searchWord });
        return this;
    }

    filter() {
        const copyQ = { ...this.bigQ };
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];
        // Convert filtering conditions
        let stringOfCopyQ = JSON.stringify(copyQ);
        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`);
        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);
        // Apply filtering conditions
        this.base = this.base.find(jsonOfCopyQ);
        return this;
    }

    pager(resultperPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        }
        const skipVal = resultperPage * (currentPage - 1);
        // Apply pagination
        this.base = this.base.limit(resultperPage).skip(skipVal);
        return this;
    }
}

module.exports = WhereClause;
