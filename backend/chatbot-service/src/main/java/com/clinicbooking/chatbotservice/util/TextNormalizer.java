package com.clinicbooking.chatbotservice.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class TextNormalizer {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^\\p{Alnum}\\s]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private TextNormalizer() {
    }

    public static String normalize(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        String withoutAccents = Normalizer
                .normalize(text, Normalizer.Form.NFD)
                .replace('\u0111', 'd')
                .replace('\u0110', 'D');

        withoutAccents = DIACRITICS.matcher(withoutAccents).replaceAll("");
        withoutAccents = NON_ALPHANUMERIC.matcher(withoutAccents).replaceAll(" ");
        withoutAccents = withoutAccents.toLowerCase(Locale.ROOT);
        return WHITESPACE.matcher(withoutAccents.trim()).replaceAll(" ");
    }
}
