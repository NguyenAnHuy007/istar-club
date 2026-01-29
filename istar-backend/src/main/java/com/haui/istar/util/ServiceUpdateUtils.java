package com.haui.istar.util;

import java.util.function.Consumer;

public class ServiceUpdateUtils {
    public static <T> void updateIfNotNull(T value, Consumer<T> setter) {
        if (value != null) setter.accept(value);
    }
    public static <T> void updateIfChanged(T newValue, T oldValue, Consumer<T> setter) {
        if (newValue != null && !newValue.equals(oldValue)) setter.accept(newValue);
    }
}
