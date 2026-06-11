package com.zhihao.admin.common.util;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Function;

public final class TreeUtils {

    private TreeUtils() {
    }

    public static <T> List<T> build(List<T> nodes, Function<T, Long> idGetter, Function<T, Long> parentIdGetter,
                                    Function<T, Integer> sortGetter, BiConsumer<T, T> childAppender, Long rootParentId) {
        Map<Long, T> nodeMap = new LinkedHashMap<>();
        nodes.stream()
                .sorted(Comparator.comparing(sortGetter, Comparator.nullsLast(Integer::compareTo)))
                .forEach(node -> nodeMap.put(idGetter.apply(node), node));

        List<T> roots = new ArrayList<>();
        for (T node : nodeMap.values()) {
            Long parentId = parentIdGetter.apply(node);
            T parent = nodeMap.get(parentId);
            if (parent == null || rootParentId.equals(parentId)) {
                roots.add(node);
            } else {
                childAppender.accept(parent, node);
            }
        }
        return roots;
    }
}
