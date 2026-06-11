package com.zhihao.admin.common.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class TreeUtilsTest {

    @Test
    void buildCreatesSortedTreeFromFlatNodes() {
        Node child = new Node(2L, 1L, 2);
        Node root = new Node(1L, 0L, 1);
        Node firstChild = new Node(3L, 1L, 1);

        List<Node> tree = TreeUtils.build(List.of(child, root, firstChild), Node::id, Node::parentId,
                Node::sort, (parent, node) -> parent.children().add(node), 0L);

        assertThat(tree).containsExactly(root);
        assertThat(root.children()).containsExactly(firstChild, child);
    }

    record Node(Long id, Long parentId, Integer sort, List<Node> children) {
        Node(Long id, Long parentId, Integer sort) {
            this(id, parentId, sort, new ArrayList<>());
        }
    }
}
