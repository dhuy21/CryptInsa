from cryptage.decrypt import (
    change_traduction_with_word,
    lettre_en_commun,
    make_traduction_sur,
    message_from_key,
)
from cryptage.mapping import (
    detecter_ponctuation,
    generer_pattern,
    mapping_with_list,
    trouver_mots_correspondants,
)


def test_pattern_numbers_letters_in_order_of_appearance():
    assert generer_pattern("elle") == "1221"
    assert generer_pattern("pour") == "1234"


def test_dictionary_lookup_finds_elle():
    words, count = trouver_mots_correspondants("elle")
    assert count == 5
    assert "elle" in words
    assert len(words) == count


def test_punctuation_is_a_character_that_only_appears_before_a_space():
    assert detecter_ponctuation("xbaxbaxca", "a") == {"point": "b", "virgule": "c"}


def test_mapping_with_known_letters_filters_dictionary_candidates():
    matches = mapping_with_list(["e"], {"e": "e"}, "elle")
    assert sorted(matches) == ["elle", "erre", "esse"]


def test_shared_letters_keep_their_position():
    assert lettre_en_commun(["elle", "elles"]) == [
        ("e", 0),
        ("l", 1),
        ("l", 2),
        ("e", 3),
    ]


def test_most_frequent_characters_skip_the_last_one():
    """'aaabbc' loses its final c, so the leaders are a then b."""
    assert make_traduction_sur("aaabbc") == (("a", 50.0), ("b", 100 / 3))


def test_message_from_key_keeps_unknown_and_empty_mappings():
    assert message_from_key("abc", {"a": "x", "b": None, "c": "z"}) == "xbz"


def test_word_mapping_writes_each_letter():
    assert change_traduction_with_word({"a": None, "b": None}, "ab", "xy") == {
        "a": "x",
        "b": "y",
    }
