import {Repository} from 'typeorm';
import * as Promise from 'bluebird';
import {SelectQueryBuilder} from 'typeorm/query-builder/SelectQueryBuilder';
import {SearchInputDto} from '../dtos/SearchInputDto';
import {SearchResultDto} from '../dtos/SearchResultDto';
import SearchQuery from '../base/SearchQuery';

export class SearchHelper {

    static async search<TTable>(
        repository: Repository<any>,
        dto: SearchInputDto,
        searchQuery: SearchQuery,
        prepareHandler: (query: SelectQueryBuilder<TTable>) => void | null = null,
    ): Promise<SearchResultDto<TTable>> {
        const result = new SearchResultDto<TTable>();

        // Defaults
        dto = {
            page: 1,
            pageSize: 50,
            ...dto,
        };

        // Create query
        const dbQuery = repository.createQueryBuilder(searchQuery.getAlias());
        const modelAlias = dbQuery.alias;

        const {hasManyRelations} = SearchQuery.prepare(repository, dbQuery, searchQuery);

        // Sort
        const sort = typeof dto.sort === 'string' ? dto.sort.split(',') : (dto.sort || []);
        if (sort.length > 0) {
            dbQuery.orderBy(sort.reduce((obj, value) => {
                const fieldNameToSort = `${modelAlias}.${value.replace('!', '')}`;
                obj[fieldNameToSort] = value.includes('!') ? 'DESC' : 'ASC';
                return obj;
            }, {}));
        }

        // Prepare
        if (prepareHandler) {
            prepareHandler.call(null, dbQuery);
        }

        // Pagination
        if (dto.pageSize > 0) {
            if (hasManyRelations) {
                dbQuery
                    .skip((dto.page - 1) * dto.pageSize)
                    .take(dto.pageSize);
            } else {
                dbQuery
                    .offset((dto.page - 1) * dto.pageSize)
                    .limit(dto.pageSize);
            }
        }

        // Execute query
        const [items, total] = await Promise.resolve(dbQuery.getManyAndCount());
        result.items = items;
        result.total = total;

        return result;
    }
}
